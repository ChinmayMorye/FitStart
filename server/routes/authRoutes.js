const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
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

// ── Streak recalculator ─────────────────────────────────────────────────────
function calcStreak(sortedDays) {
  let streak = 0;
  for (let i = 1; i <= (sortedDays[sortedDays.length - 1] || 0); i++) {
    if (sortedDays.includes(i)) streak++;
    else break;
  }
  return streak;
}

function deriveCurrentDay(completedDays) {
  return (completedDays || []).length + 1;
}

function serializeJourney(user) {
  return {
    totalDays:      user.journey_total_days,
    workoutPlace:   user.journey_workout_place,
    completedDays:  user.journey_completed_days,
    startDate:      user.journey_start_date,
    lastActiveDate: user.journey_last_active,
    currentStreak:  user.journey_streak,
    currentDay:     deriveCurrentDay(user.journey_completed_days),
  };
}

function serializePreferences(user) {
  return {
    dietType:         user.diet_plan,
    workoutDays:      user.workout_days,
    workoutPlanId:    user.workout_plan,
    restDay:          user.rest_day,
    saveDiet:         user.save_diet,
    saveWorkout:      user.save_workout,
    lastCompletedDay: user.last_completed_day,
    prefsUpdatedAt:   user.pref_updated_at,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, age, height, weight } = req.body;
    if (!username || !password || !age || !height || !weight) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if username already taken
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) return res.status(400).json({ error: 'Username already taken' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashedPassword, age, height, weight }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'User Created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        username:       user.username,
        weight:         user.weight,
        height:         user.height,
        age:            user.age,
        profilePicture: user.profile_picture,
        journeyData:    serializeJourney(user),
        preferences:    serializePreferences(user),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    const { password: _, ...safeUser } = user;
    res.json({
      user: {
        ...safeUser,
        journeyData: serializeJourney(user),
        preferences: serializePreferences(user),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOURNEY ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/journey
router.patch('/journey', verifyToken, async (req, res) => {
  try {
    const { totalDays, workoutPlace, completedDays, currentStreak, startDate } = req.body;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (fetchError || !user) return res.status(404).json({ message: 'User not found' });

    const updates = { journey_last_active: new Date().toISOString(), updated_at: new Date().toISOString() };

    if (startDate && !user.journey_start_date) updates.journey_start_date = new Date(startDate).toISOString();
    else if (!user.journey_start_date && totalDays) updates.journey_start_date = new Date().toISOString();

    if (totalDays     !== undefined) updates.journey_total_days    = totalDays;
    if (workoutPlace  !== undefined) updates.journey_workout_place = workoutPlace;
    if (completedDays !== undefined) updates.journey_completed_days = completedDays;
    if (currentStreak !== undefined) updates.journey_streak        = currentStreak;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Journey updated', journeyData: serializeJourney(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/journey-length
router.patch('/journey-length', verifyToken, async (req, res) => {
  try {
    const { totalDays } = req.body;
    if (!totalDays || typeof totalDays !== 'number' || totalDays < 1 || totalDays > 365) {
      return res.status(400).json({ message: 'totalDays must be a number between 1 and 365' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (fetchError || !user) return res.status(404).json({ message: 'User not found' });

    let completedDays = user.journey_completed_days || [];
    if (totalDays < user.journey_total_days) {
      completedDays = completedDays.filter(d => d <= totalDays);
      // Delete history beyond new limit
      await supabase.from('day_histories').delete()
        .eq('user_id', req.userId)
        .gt('day_number', totalDays);
    }

    const streak = calcStreak([...completedDays].sort((a, b) => a - b));

    const { data: updated, error } = await supabase
      .from('users')
      .update({
        journey_total_days:    totalDays,
        journey_completed_days: completedDays,
        journey_streak:        streak,
        journey_last_active:   new Date().toISOString(),
        updated_at:            new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Journey length updated', journeyData: serializeJourney(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/complete-day
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

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (fetchError || !user) return res.status(404).json({ message: 'User not found' });

    const updates = { journey_last_active: new Date().toISOString(), updated_at: new Date().toISOString() };

    // Set startDate on first completion
    if (!user.journey_start_date) {
      const start = new Date();
      start.setDate(start.getDate() - (dayNumber - 1));
      start.setHours(0, 0, 0, 0);
      updates.journey_start_date = start.toISOString();
    }

    if (totalDays    !== undefined && !user.journey_total_days)          updates.journey_total_days    = totalDays;
    if (workoutPlace !== undefined && !user.journey_workout_place?.length) updates.journey_workout_place = workoutPlace;

    // Idempotent insert
    let completedDays = user.journey_completed_days || [];
    if (!completedDays.includes(dayNumber)) completedDays.push(dayNumber);
    completedDays.sort((a, b) => a - b);

    updates.journey_completed_days = completedDays;
    updates.journey_streak = calcStreak(completedDays);

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    // Upsert DayHistory
    await supabase.from('day_histories').upsert({
      user_id:              req.userId,
      day_number:           dayNumber,
      completed_at:         new Date().toISOString(),
      diet_status:          dietStatus,
      workout_status:       workoutStatus,
      muscles_worked:       musclesWorked,
      total_days_in_journey: updated.journey_total_days,
    }, { onConflict: 'user_id,day_number' });

    res.json({ message: 'Day completed', journeyData: serializeJourney(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { data: history, error } = await supabase
      .from('day_histories')
      .select('*')
      .eq('user_id', req.userId)
      .order('day_number', { ascending: true });

    if (error) throw error;
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PREFERENCES ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/preferences
router.patch('/preferences', verifyToken, async (req, res) => {
  try {
    const { dietType, workoutDays, workoutPlanId, username, restDay,
            saveDiet, saveWorkout, lastCompletedDay } = req.body;

    const updates = { pref_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() };

    if (dietType      !== undefined) updates.diet_plan    = dietType      || null;
    if (workoutDays   !== undefined) updates.workout_days = workoutDays   || null;
    if (workoutPlanId !== undefined) updates.workout_plan = workoutPlanId || null;
    if (restDay       !== undefined && restDay) updates.rest_day = restDay;
    if (saveDiet      !== undefined) updates.save_diet    = !!saveDiet;
    if (saveWorkout   !== undefined) updates.save_workout = !!saveWorkout;
    if (lastCompletedDay !== undefined) updates.last_completed_day = lastCompletedDay;

    if (username !== undefined && username.trim().length >= 2) {
      const { data: taken } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .neq('id', req.userId)
        .single();
      if (taken) return res.status(409).json({ message: 'Username already taken' });
      updates.username = username.trim();
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({
      message:     'Preferences saved',
      preferences: serializePreferences(updated),
      username:    updated.username,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESET ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/reset-journey
router.patch('/reset-journey', verifyToken, async (req, res) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('journey_total_days, journey_workout_place')
      .eq('id', req.userId)
      .single();

    if (fetchError || !user) return res.status(404).json({ message: 'User not found' });

    const { data: updated, error } = await supabase
      .from('users')
      .update({
        journey_completed_days: [],
        journey_start_date:     null,
        journey_last_active:    null,
        journey_streak:         0,
        updated_at:             new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    // Delete all history for this user
    await supabase.from('day_histories').delete().eq('user_id', req.userId);

    res.json({ message: 'Journey reset successfully', journeyData: serializeJourney(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPDATE BODY STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// PATCH /api/auth/update-body-stats
router.patch('/update-body-stats', verifyToken, async (req, res) => {
  try {
    const { height, weight, age } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (height !== undefined && height > 0 && height <= 300) updates.height = Number(height);
    if (weight !== undefined && weight > 0 && weight <= 500) updates.weight = Number(weight);
    if (age    !== undefined && age    > 0 && age    <= 120)  updates.age    = Number(age);

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Body stats updated', height: updated.height, weight: updated.weight, age: updated.age });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;