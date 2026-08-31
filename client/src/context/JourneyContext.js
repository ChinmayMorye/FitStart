// ── JourneyContext.js ─────────────────────────────────────────────────────────
// Single source of truth for the user's journey progress.
// Consumed by StreakPage, DietPage, WorkoutPage, and Dashboard via useJourney().
//
// On mount:        loads from localStorage (fast, offline-safe).
// On day complete: optimistic update → broadcastDayComplete() → server call
// On length change: PATCH /journey-length → re-render Journey Map nodes
// On login:        syncFromProfile() restores state from server DB response

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { broadcastDayComplete } from '../utils/journeySync';

const API_BASE = process.env.REACT_APP_API_URL || '';

const JourneyContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCachedUser() {
  try { return JSON.parse(localStorage.getItem('fitstart_user') || '{}'); } catch { return {}; }
}
function getCachedStreak() {
  try { return JSON.parse(localStorage.getItem('fitstart_streak') || '{}'); } catch { return {}; }
}

// Streak = longest consecutive run from Day 1 (no gaps allowed)
function calcStreak(days) {
  let streak = 0;
  for (let i = 1; i <= (days[days.length - 1] || 0); i++) {
    if (days.includes(i)) streak++;
    else break;
  }
  return streak;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function JourneyProvider({ children }) {
  const [completedDays,  setCompletedDays]  = useState(() => getCachedStreak().completedDays  || []);
  const [currentStreak,  setCurrentStreak]  = useState(() => getCachedStreak().currentStreak  || 0);
  const [totalDays,      setTotalDaysState] = useState(() => getCachedStreak().totalDays       || 0);
  const [workoutPlace,   setWorkoutPlace]   = useState(() => getCachedStreak().workoutPlace    || []);
  const [startDate,      setStartDate]      = useState(() => {
    const u = getCachedUser();
    const s = getCachedStreak();
    return u?.journeyData?.startDate || s?.startDate || null;
  });
  const [syncing,        setSyncing]        = useState(false);
  const [changingLength, setChangingLength] = useState(false);

  // Ref so callbacks always see current values without re-creating listeners
  const stateRef = useRef({});
  stateRef.current = { completedDays, currentStreak, totalDays, workoutPlace, startDate };

  // ── Cross-tab storage sync ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'fitstart_streak' && e.newValue) {
        try {
          const s = JSON.parse(e.newValue);
          if (s.completedDays) setCompletedDays(s.completedDays);
          if (s.currentStreak !== undefined) setCurrentStreak(s.currentStreak);
          if (s.totalDays)     setTotalDaysState(s.totalDays);
          if (s.startDate)     setStartDate(s.startDate);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ── Persist helper ─────────────────────────────────────────────────────
  const persistLocally = useCallback((patch) => {
    try {
      const cache = getCachedStreak();
      Object.assign(cache, patch);
      localStorage.setItem('fitstart_streak', JSON.stringify(cache));

      const u = getCachedUser();
      if (u.journeyData) {
        Object.assign(u.journeyData, patch);
        localStorage.setItem('fitstart_user', JSON.stringify(u));
      }
      if (patch.completedDays !== undefined) {
        localStorage.setItem('fitstart_completed_days', JSON.stringify(patch.completedDays));
      }
    } catch (_) {}
  }, []);

  // ── Sync context from a fresh server profile response ──────────────────
  const syncFromProfile = useCallback((journeyData) => {
    if (!journeyData) return;
    if (journeyData.completedDays !== undefined) setCompletedDays(journeyData.completedDays);
    if (journeyData.currentStreak !== undefined) setCurrentStreak(journeyData.currentStreak);
    if (journeyData.totalDays)     setTotalDaysState(journeyData.totalDays);
    if (journeyData.startDate)     setStartDate(journeyData.startDate);
    if (journeyData.workoutPlace)  setWorkoutPlace(journeyData.workoutPlace);

    // Persist the full journeyData into fitstart_streak so all pages
    // (StreakPage, DietPage, WorkoutPage) read fresh values after reload.
    try {
      const cache = getCachedStreak();
      const merged = { ...cache, ...journeyData };
      localStorage.setItem('fitstart_streak', JSON.stringify(merged));
    } catch (_) {}
  }, []);

  // ── Init journey (called from Dashboard when user starts new journey) ───
  const initJourney = useCallback((config) => {
    setCompletedDays([]);
    setCurrentStreak(0);
    setTotalDaysState(config.totalDays || 0);
    setWorkoutPlace(config.workoutPlace || []);
    if (config.startDate) setStartDate(config.startDate);
  }, []);

  // ── DYNAMIC JOURNEY LENGTH CHANGE ──────────────────────────────────────
  // Updates totalDays in React state + localStorage + MongoDB.
  // Journey Map re-renders automatically since it reads totalDays from context.
  const setTotalDays = useCallback(async (newTotal) => {
    if (!newTotal || newTotal < 1 || newTotal > 365) return;
    const token = localStorage.getItem('fitstart_token');

    // Trim completedDays if shortened
    const trimmed = stateRef.current.completedDays.filter(d => d <= newTotal);
    const newStreak = calcStreak(trimmed);

    // Optimistic update
    setTotalDaysState(newTotal);
    setCompletedDays(trimmed);
    setCurrentStreak(newStreak);
    persistLocally({ totalDays: newTotal, completedDays: trimmed, currentStreak: newStreak });

    // Server call
    if (token) {
      setChangingLength(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/journey-length`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ totalDays: newTotal }),
        });
        if (res.ok) {
          const data = await res.json();
          const jd = data.journeyData;
          setCompletedDays(jd.completedDays);
          setCurrentStreak(jd.currentStreak);
          persistLocally({
            totalDays: jd.totalDays,
            completedDays: jd.completedDays,
            currentStreak: jd.currentStreak,
          });
        }
      } catch (_) {} finally {
        setChangingLength(false);
      }
    }

    // Notify DietPage / WorkoutPage in the same tab so totalWeeks updates instantly
    try {
      window.dispatchEvent(new CustomEvent('fitstart_journey_updated', { detail: { totalDays: newTotal } }));
    } catch (_) {}
  }, [persistLocally]);

  // ── CORE: mark a journey day complete ───────────────────────────────────
  // Flow:
  //  1. Optimistic update → React state + localStorage immediately
  //  2. broadcastDayComplete() → Diet + Workout localStorage + window event
  //  3. Server POST /complete-day → authoritative response overwrites state
  //  4. DayHistory entry written atomically on the server (upsert)
  const completeDay = useCallback(async (dayNumber, opts = {}) => {
    const {
      completedDays: prev,
      totalDays: td,
      workoutPlace: wp,
      startDate: sd,
    } = stateRef.current;
    const token = localStorage.getItem('fitstart_token');

    // Optimistic update
    const optimisticDays   = prev.includes(dayNumber) ? prev : [...prev, dayNumber].sort((a, b) => a - b);
    const optimisticStreak = calcStreak(optimisticDays);

    setCompletedDays(optimisticDays);
    setCurrentStreak(optimisticStreak);
    persistLocally({ completedDays: optimisticDays, currentStreak: optimisticStreak });

    // Diet + Workout sync (writes their localStorage + fires window event)
    const effectiveStartDate = sd || new Date().toISOString();
    const dietType = getCachedUser()?.preferences?.dietType || null;
    const wDays    = parseInt(localStorage.getItem('fitstart_workout_days') || '0') || null;
    const planId   = localStorage.getItem('fitstart_workout_plan') || null;
    broadcastDayComplete(dayNumber, effectiveStartDate, dietType, wDays, planId);

    // Server call
    if (!token) return { completedDays: optimisticDays, currentStreak: optimisticStreak };

    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/complete-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dayNumber,
          totalDays:    td,
          workoutPlace: wp,
          dietStatus:   opts.dietStatus    || 'completed',
          workoutStatus:opts.workoutStatus || 'completed',
          musclesWorked:opts.musclesWorked  || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jd   = data.journeyData;

        setCompletedDays(jd.completedDays);
        setCurrentStreak(jd.currentStreak);

        const patch = { completedDays: jd.completedDays, currentStreak: jd.currentStreak };
        if (jd.startDate) { patch.startDate = jd.startDate; setStartDate(jd.startDate); }
        persistLocally(patch);

        return { completedDays: jd.completedDays, currentStreak: jd.currentStreak };
      }
    } catch (_) {
      // Server unreachable — optimistic state already applied
    } finally {
      setSyncing(false);
    }

    return { completedDays: optimisticDays, currentStreak: optimisticStreak };
  }, [persistLocally]);

  // ── Reset journey ───────────────────────────────────────────────────────
  const resetJourney = useCallback(async () => {
    setCompletedDays([]);
    setCurrentStreak(0);
    setStartDate(null);
    persistLocally({ completedDays: [], currentStreak: 0, startDate: null });

    try { localStorage.removeItem('fitstart_completed_days'); } catch (_) {}

    const token = localStorage.getItem('fitstart_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/reset-journey`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.journeyData) syncFromProfile(data.journeyData);
        }
      } catch (_) {}
    }
  }, [persistLocally, syncFromProfile]);

  const value = {
    // State
    completedDays,
    currentStreak,
    totalDays,
    workoutPlace,
    startDate,
    syncing,
    changingLength,
    // Derived
    currentDay:  completedDays.length + 1,
    progressPct: totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0,
    // Actions
    completeDay,
    resetJourney,
    initJourney,
    syncFromProfile,
    setTotalDays,        // ← dynamic node count change
    setWorkoutPlace,
    setStartDate,
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used inside <JourneyProvider>');
  return ctx;
}
