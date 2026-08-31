// ── Journey Date Helpers ──────────────────────────────────────────────────────
// Maps a journey day number (1-based) → calendar day → correct diet/workout data
// based on the user's journey startDate.

import { DIET_PLANS } from '../data/dietPlans';
import { SPLITS, buildSlots, ALL_DAYS } from '../data/workoutData';

/**
 * Given a 1-based day number and the journey start date,
 * returns the day-of-week index: 0=Monday … 6=Sunday
 */
export function getDayOfWeek(dayNumber, startDate) {
  const start = new Date(startDate);
  const target = new Date(start);
  target.setDate(start.getDate() + (dayNumber - 1));
  // JS getDay(): 0=Sun, 1=Mon … 6=Sat  →  convert to 0=Mon … 6=Sun
  const jsDay = target.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Returns the human-readable day name (e.g. "Monday") for a journey day */
export function getDayName(dayNumber, startDate) {
  return ALL_DAYS[getDayOfWeek(dayNumber, startDate)];
}

/**
 * Named alias matching the feature spec: getWeekday(startDate, dayNumber).
 * Returns the weekday string (e.g. "Saturday").
 */
export function getWeekday(startDate, dayNumber) {
  return getDayName(dayNumber, startDate);
}

/**
 * Returns a full rolling-week label for a Journey Map node.
 * Example: getRollingWeekLabel(9, startDate) → "Day 9 — Saturday"
 */
export function getRollingWeekLabel(dayNumber, startDate) {
  if (!startDate) return `Day ${dayNumber}`;
  return `Day ${dayNumber} — ${getDayName(dayNumber, startDate)}`;
}

/** Returns the week index 0-3 (cycling every 4 weeks) for diet plan lookup */
export function getWeekIndex(dayNumber) {
  return Math.floor((dayNumber - 1) / 7) % 4;
}

/**
 * Returns the array of meal-slots for the given journey day.
 * Each slot: { meal, time, icon, items }
 */
export function getDietForDay(dayNumber, startDate, dietType) {
  const type = dietType === 'nonveg' ? 'nonveg' : 'veg';
  const plan = DIET_PLANS[type];            // 4-week array
  const weekIdx = getWeekIndex(dayNumber);
  const dayOfWeek = getDayOfWeek(dayNumber, startDate); // 0=Mon…6=Sun
  return (plan[weekIdx] && plan[weekIdx][dayOfWeek]) || [];
}

/**
 * Returns workout info for the given journey day:
 *   { type: 'workout', dayData, dayName, accentColor, planName }
 *   { type: 'rest',    dayName }
 *   null  — if no plan is configured
 */
export function getWorkoutInfoForDay(dayNumber, startDate, workoutDays, planId) {
  if (!workoutDays || !planId) return null;
  const dayOfWeek = getDayOfWeek(dayNumber, startDate);
  const splitData  = SPLITS[workoutDays];
  if (!splitData) return null;
  const plan = splitData.plans.find(p => p.id === planId);
  if (!plan) return null;

  const slots = buildSlots(workoutDays);
  const workoutSlot = slots.indexOf(dayOfWeek);

  if (workoutSlot !== -1) {
    return {
      type: 'workout',
      dayData: plan.days[workoutSlot],
      dayName: ALL_DAYS[dayOfWeek],
      accentColor: plan.accentColor,
      planName: plan.name,
    };
  }
  return { type: 'rest', dayName: ALL_DAYS[dayOfWeek] };
}
