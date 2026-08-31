// ── journeySync.js ────────────────────────────────────────────────────────────
// Bridges the Journey Map's day-number system (Day 1–60) with the
// Diet/Workout pages' week+weekday-index system.
//
// When a journey day is completed, call broadcastDayComplete().
// Diet/Workout pages listen for the `fitstart_day_complete` window event and
// auto-mark their corresponding weekday card as done — no page refresh needed.

import { useEffect, useCallback } from 'react';
import { getDayOfWeek, getWeekIndex } from './journeyHelpers';
import { ALL_DAYS, SPLITS, buildSlots } from '../data/workoutData';
import { DIET_PLANS } from '../data/dietPlans';

// ── Internal key helpers (must match DietPage.js and WorkoutPage.js keys) ────
const dietKey  = (dietType, week, dayIdx) =>
  `fitstart_diet_checks_${dietType}_w${week}_d${dayIdx}`;
const itemKey  = (mi, ii) => `m${mi}_i${ii}`;
const muscleKey = (week, dayName) =>
  `fitstart_muscles_w${week}_${dayName.toLowerCase().replace(/ /g, '_')}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Given a 1-based journey day number and the user's start date, returns:
 *   { journeyWeek, dayOfWeek, dayName }
 * journeyWeek = 0-based week index in the journey  (e.g. Day 8 → week 1)
 * dayOfWeek   = 0=Mon … 6=Sun
 */
export function resolveDayCoords(dayNumber, startDate) {
  const journeyWeek = Math.floor((dayNumber - 1) / 7);
  const dayOfWeek   = getDayOfWeek(dayNumber, startDate);
  const dayName     = ALL_DAYS[dayOfWeek];
  return { journeyWeek, dayOfWeek, dayName };
}

// ── Diet sync ─────────────────────────────────────────────────────────────────

/**
 * Marks every meal item for the journey day as checked in localStorage
 * so DietPage shows "✓ Done" when it next reads storage.
 */
export function markDietDayComplete(dayNumber, startDate, dietType) {
  if (!dietType) return;
  try {
    const { journeyWeek, dayOfWeek } = resolveDayCoords(dayNumber, startDate);
    const weekIdx = getWeekIndex(dayNumber);    // 4-week rotating diet cycle
    const plan    = DIET_PLANS[dietType]?.[weekIdx % 4]?.[dayOfWeek] || [];

    const checks = {};
    plan.forEach((slot, mi) => {
      slot.items
        .filter(i => !i.hide)
        .forEach((_, ii) => { checks[itemKey(mi, ii)] = true; });
    });

    localStorage.setItem(dietKey(dietType, journeyWeek, dayOfWeek), JSON.stringify(checks));
  } catch (e) {
    console.warn('[journeySync] markDietDayComplete:', e);
  }
}

// ── Workout sync ──────────────────────────────────────────────────────────────

/**
 * Marks all muscles as done (or rest day as acknowledged) for the journey day
 * in localStorage so WorkoutPage shows "✓ DONE" and a green progress bar.
 */
export function markWorkoutDayComplete(dayNumber, startDate, workoutDays, planId) {
  if (!workoutDays || !planId) return;
  try {
    const { journeyWeek, dayOfWeek, dayName } = resolveDayCoords(dayNumber, startDate);

    const splitData = SPLITS[workoutDays];
    if (!splitData) return;
    const plan = splitData.plans.find(p => p.id === planId);
    if (!plan) return;

    const slots = buildSlots(workoutDays);
    const wSlot = slots.indexOf(dayOfWeek);

    if (wSlot !== -1) {
      // Workout day → mark all muscles true
      const count   = plan.days[wSlot].muscles.length;
      const muscles = Array(count).fill(true);
      localStorage.setItem(muscleKey(journeyWeek, dayName), JSON.stringify(muscles));
    } else {
      // Rest day → mark as acknowledged
      const key = `fitstart_rest_done_w${journeyWeek}_${dayName.toLowerCase()}`;
      localStorage.setItem(key, '1');
    }
  } catch (e) {
    console.warn('[journeySync] markWorkoutDayComplete:', e);
  }
}

// ── Main broadcast function ──────────────────────────────────────────────────

/**
 * Call this immediately after a journey day is marked complete.
 *
 * It:
 * 1. Writes diet completion state to localStorage
 * 2. Writes workout completion state to localStorage
 * 3. Dispatches a `fitstart_day_complete` window event so any currently-
 *    mounted Diet/Workout page re-renders without a full page refresh.
 *
 * @param {number} dayNumber   1-based journey day (e.g. 3)
 * @param {string} startDate   ISO string — user's journey start date
 * @param {string|null} dietType    'veg' | 'nonveg' | null
 * @param {number|null} workoutDays weekly workout frequency | null
 * @param {string|null} planId      'A' | 'B' | null
 */
export function broadcastDayComplete(dayNumber, startDate, dietType, workoutDays, planId) {
  markDietDayComplete(dayNumber, startDate, dietType);
  markWorkoutDayComplete(dayNumber, startDate, workoutDays, planId);

  try {
    window.dispatchEvent(new CustomEvent('fitstart_day_complete', {
      detail: { dayNumber, startDate, dietType, workoutDays, planId },
    }));
  } catch (_) {}
}

// ── React hook ────────────────────────────────────────────────────────────────

/**
 * useSyncListener — add to DietPage / WorkoutPage to react immediately when
 * a journey day is completed elsewhere (same tab or cross-tab via storage event).
 *
 * @param {Function} onSync  () => void — call a state setter to trigger re-render
 */
export function useSyncListener(onSync) {
  const stable = useCallback(onSync, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Same-tab: completed from StreakPage while Diet/Workout page is also mounted
    window.addEventListener('fitstart_day_complete', stable);
    // Cross-tab: user completed a day in another browser tab
    const storageHandler = (e) => {
      if (e.key === 'fitstart_streak' || (e.key && e.key.startsWith('fitstart_muscles')) ||
          (e.key && e.key.startsWith('fitstart_diet_checks'))) {
        stable();
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('fitstart_day_complete', stable);
      window.removeEventListener('storage', storageHandler);
    };
  }, [stable]);
}
