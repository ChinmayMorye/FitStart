const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DayHistory = require('../models/DayHistory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ── JWT middleware ──────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// ── Streak recalculator (pure function, no DB side effects) ────────────────
// Counts the longest consecutive run of days from Day 1.
function calcStreak(sortedDays) {
  let streak = 0;
  for (let i = 1; i <= (sortedDays[sortedDays.length - 1] || 0); i++) {
    if (sortedDays.includes(i)) streak++;
    else break;
  }
  return streak;
}

// ── Derive currentDay from completedDays (never store it — it's always fresh) ─
// currentDay = next day to complete = completedDays.length + 1 (min 1)
function deriveCurrentDay(journeyData) {
  return (journeyData.completedDays || []).length + 1;
}

// ── Serialise journeyData + inject currentDay ────────────────────────────────
function serializeJourney(journeyData) {
  const obj = typeof journeyData.toObject === 'function' ? journeyData.toObject() : { ...journeyData };
  obj.currentDay = deriveCurrentDay(obj);
  return obj;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: 'User Created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
// Returns full user data so client can restore its state without extra fetches.
// Plans are STICKY — they never reset here. Only change via /preferences route.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return FULL profile so the client can rehydrate everything from one call.
    // journeyData.completedDays is the ground truth — the client never needs to
    // re-select plans if preferences.dietType / workoutDays / workoutPlanId exist.
    res.json({
      token,
      user: {
        username:       user.username,
        weight:         user.weight,
        height:         user.height,
        age:            user.age,
        profilePicture: user.profilePicture,
        journeyData:    user.journeyData,   // completedDays, streak, startDate, totalDays, workoutPlace
        preferences:    user.preferences,  // dietType, workoutDays, workoutPlanId  ← STICKY
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile — full profile including journey + preferences
// Used on app boot to get fresh data after a cached login.
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOURNEY ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/journey — bulk-update journey progress (used for reset / init)
router.patch('/journey', verifyToken, async (req, res) => {
  try {
    const { totalDays, workoutPlace, completedDays, currentStreak, startDate } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Accept an explicit startDate from the client (sent on journey creation).
    // Fall back to setting it now if it still isn't set and totalDays is provided.
    if (startDate && !user.journeyData.startDate) {
      user.journeyData.startDate = new Date(startDate);
    } else if (!user.journeyData.startDate && totalDays) {
      user.journeyData.startDate = new Date();
    }
    if (totalDays      !== undefined) user.journeyData.totalDays     = totalDays;
    if (workoutPlace   !== undefined) user.journeyData.workoutPlace  = workoutPlace;
    if (completedDays  !== undefined) user.journeyData.completedDays = completedDays;
    if (currentStreak  !== undefined) user.journeyData.currentStreak = currentStreak;
    user.journeyData.lastActiveDate = new Date();

    await user.save();
    res.json({ message: 'Journey updated', journeyData: serializeJourney(user.journeyData) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/journey-length — DYNAMIC NODE COUNT CHANGE
// Updates totalDays in DB; trims completedDays if they exceed the new length.
// The Journey Map re-renders on the client once it receives the updated totalDays.
router.patch('/journey-length', verifyToken, async (req, res) => {
  try {
    const { totalDays } = req.body;
    if (!totalDays || typeof totalDays !== 'number' || totalDays < 1 || totalDays > 365) {
      return res.status(400).json({ message: 'totalDays must be a number between 1 and 365' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prevTotal = user.journeyData.totalDays;
    user.journeyData.totalDays = totalDays;

    // If the user shortened their journey, trim any completedDays that are now out of range
    if (totalDays < prevTotal) {
      user.journeyData.completedDays = user.journeyData.completedDays.filter(d => d <= totalDays);
      // Also delete history entries beyond the new limit
      await DayHistory.deleteMany({ userId: req.userId, dayNumber: { $gt: totalDays } });
    }

    // Recalculate streak after trim
    const days = user.journeyData.completedDays.sort((a, b) => a - b);
    user.journeyData.currentStreak = calcStreak(days);
    user.journeyData.lastActiveDate = new Date();

    await user.save();

    res.json({
      message: 'Journey length updated',
      journeyData: serializeJourney(user.journeyData),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/complete-day — ATOMIC DAY COMPLETION
// This is the core progress endpoint. It:
//   1. Adds dayNumber to completedDays (idempotent)
//   2. Recalculates streak from consecutive run starting at Day 1
//   3. Writes an immutable DayHistory document (upsert — safe to retry)
//   4. Returns the authoritative journeyData so the client can sync
router.post('/complete-day', verifyToken, async (req, res) => {
  try {
    const {
      dayNumber,
      totalDays,
      workoutPlace,
      dietStatus    = 'completed',
      workoutStatus = 'completed',
      musclesWorked = [],
    } = req.body;

    if (!dayNumber || typeof dayNumber !== 'number') {
      return res.status(400).json({ message: 'dayNumber (number) is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ── Set startDate on very first completion ──────────────────────────────
    // Back-calculate so that Day 1 maps to (today - (dayNumber - 1) days).
    // This keeps the calendar-date ↔ journey-day mapping correct for
    // all future diet/workout lookups regardless of which day they complete first.
    if (!user.journeyData.startDate) {
      const start = new Date();
      start.setDate(start.getDate() - (dayNumber - 1));
      start.setHours(0, 0, 0, 0);
      user.journeyData.startDate = start;
    }

    // Sync totalDays and workoutPlace only if not already set
    if (totalDays    !== undefined && !user.journeyData.totalDays)           user.journeyData.totalDays    = totalDays;
    if (workoutPlace !== undefined && !user.journeyData.workoutPlace?.length) user.journeyData.workoutPlace = workoutPlace;

    // ── Idempotent insert ───────────────────────────────────────────────────
    if (!user.journeyData.completedDays.includes(dayNumber)) {
      user.journeyData.completedDays.push(dayNumber);
    }
    user.journeyData.completedDays.sort((a, b) => a - b);

    // ── Recalculate streak ──────────────────────────────────────────────────
    user.journeyData.currentStreak = calcStreak(user.journeyData.completedDays);
    user.journeyData.lastActiveDate = new Date();

    // ── Save user ───────────────────────────────────────────────────────────
    await user.save();

    // ── Write immutable DayHistory entry (upsert) ───────────────────────────
    // Using findOneAndUpdate + upsert so retrying the same day is safe.
    await DayHistory.findOneAndUpdate(
      { userId: req.userId, dayNumber },
      {
        $set: {
          completedAt:        new Date(),
          dietStatus,
          workoutStatus,
          musclesWorked,
          totalDaysInJourney: user.journeyData.totalDays,
        },
        $setOnInsert: { userId: req.userId, dayNumber },
      },
      { upsert: true, new: true }
    );

    res.json({
      message:     'Day completed',
      journeyData: serializeJourney(user.journeyData),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/history — per-user DayHistory (for timeline / analytics)
// Returns sorted history so client can display "Day 3 completed on April 8" etc.
router.get('/history', verifyToken, async (req, res) => {
  try {
    const history = await DayHistory
      .find({ userId: req.userId })
      .sort({ dayNumber: 1 })
      .select('-__v');
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN & PREFERENCES ROUTES  (STICKY — never resets on login)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/preferences — save diet/workout plan choice OR change username
// This is the ONLY place selections can change. Login never touches preferences.
router.patch('/preferences', verifyToken, async (req, res) => {
  try {
    const { dietType, workoutDays, workoutPlanId, username, restDay,
            saveDiet, saveWorkout, lastCompletedDay } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Accept null / empty-string as "clear this preference"
    // This makes "Change Plan" reliably wipe the saved selection.
    if (dietType      !== undefined) user.preferences.dietType      = dietType      || null;
    if (workoutDays   !== undefined) user.preferences.workoutDays   = workoutDays   || null;
    if (workoutPlanId !== undefined) user.preferences.workoutPlanId = workoutPlanId || null;

    // restDay: persist the user's chosen rest day (e.g. 'Sunday', 'Saturday')
    // Falls back to 'Sunday' if cleared. Never stored as null.
    if (restDay !== undefined && restDay) user.preferences.restDay = restDay;

    // "Save for future" checkbox flags — only update if explicitly sent
    if (saveDiet    !== undefined) user.preferences.saveDiet    = !!saveDiet;
    if (saveWorkout !== undefined) user.preferences.saveWorkout = !!saveWorkout;

    // lastCompletedDay — updated after each day completion from StreakPage
    if (lastCompletedDay !== undefined) user.preferences.lastCompletedDay = lastCompletedDay;

    // Always stamp the time of last preference change
    user.preferences.prefsUpdatedAt = new Date();

    // Allow username change through this route
    if (username !== undefined && username.trim().length >= 2) {
      const taken = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: 'Username already taken' });
      user.username = username.trim();
    }

    await user.save();
    res.json({
      message:     'Preferences saved',
      preferences: user.preferences,
      username:    user.username,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPDATE BODY STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/update-body-stats — update height, weight, age
router.patch('/update-body-stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { height, weight, age } = req.body;

    if (height !== undefined && height > 0 && height <= 300) user.height = Number(height);
    if (weight !== undefined && weight > 0 && weight <= 500) user.weight = Number(weight);
    if (age    !== undefined && age    > 0 && age    <= 120)  user.age    = Number(age);

    await user.save();
    res.json({
      message: 'Body stats updated',
      height: user.height,
      weight: user.weight,
      age:    user.age,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOURNEY RESET ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/reset-journey — user resets their OWN journey to zero
// Does NOT clear preferences (diet/workout plan stays sticky).
router.patch('/reset-journey', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Reset progress but keep totalDays / workoutPlace so journey structure is preserved
    const prevTotal    = user.journeyData.totalDays;
    const prevWorkout  = user.journeyData.workoutPlace;
    user.journeyData = {
      totalDays:      prevTotal,
      workoutPlace:   prevWorkout,
      completedDays:  [],
      startDate:      null,
      lastActiveDate: null,
      currentStreak:  0,
    };
    await user.save();

    // Also wipe DayHistory for this user
    await DayHistory.deleteMany({ userId: req.userId });

    res.json({ message: 'Journey reset successfully', journeyData: serializeJourney(user.journeyData) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/admin-reset — dev tool: reset any user by username + secret
router.post('/admin-reset', async (req, res) => {
  try {
    const { username, secret } = req.body;
    if (secret !== 'fitstart_admin_2024') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: `User '${username}' not found` });
    user.journeyData = {
      totalDays: null, workoutPlace: [], completedDays: [],
      startDate: null, lastActiveDate: null, currentStreak: 0,
    };
    await user.save();
    await DayHistory.deleteMany({ userId: user._id });
    res.json({ message: `Journey reset for ${username}`, journeyData: user.journeyData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/admin/stats — owner-only stats dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'fitstart_admin_2024') return res.status(403).json({ message: 'Forbidden' });

    const totalUsers      = await User.countDocuments();
    const sevenDaysAgo    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentlyActive   = await User.countDocuments({ 'journeyData.lastActiveDate': { $gte: sevenDaysAgo } });
    const vegCount         = await User.countDocuments({ 'preferences.dietType': 'veg' });
    const nonvegCount      = await User.countDocuments({ 'preferences.dietType': 'nonveg' });

    // All users — include password hash so admin can see it
    const allUsers    = await User.find().sort({ createdAt: -1 }).lean();
    const newUsers    = await User.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }).lean();
    const activeUsers = await User.find({ 'journeyData.lastActiveDate': { $gte: sevenDaysAgo } })
      .sort({ 'journeyData.lastActiveDate': -1 }).lean();

    res.json({
      totalUsers, newUsersThisWeek, recentlyActive,
      dietBreakdown: { veg: vegCount, nonveg: nonvegCount },
      allUsers, newUsers, activeUsers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/admin/clear-all — wipe all users + history (owner only)
router.delete('/admin/clear-all', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'fitstart_admin_2024') return res.status(403).json({ message: 'Forbidden' });
    const userResult    = await User.deleteMany({});
    const historyResult = await DayHistory.deleteMany({});
    res.json({
      message: 'All users and history deleted.',
      deletedUsers:   userResult.deletedCount,
      deletedHistory: historyResult.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;