import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_DAYS, DAY_INDEX, buildSlots, REST_CARDS, SPLITS, COLORS } from '../data/workoutData';
import { useSyncListener } from '../utils/journeySync';

const API_BASE = process.env.REACT_APP_API_URL || '';

// ── Journey helpers ───────────────────────────────────────────────────────────
function getJourneyWeeks() {
  try {
    const s = JSON.parse(localStorage.getItem('fitstart_streak') || 'null');
    if (s?.totalDays) return Math.ceil(s.totalDays / 7);
  } catch {}
  return 4;
}

// ── Per-muscle storage (per week + dayName) ───────────────────────────────────
// stores JSON array of booleans, one per muscle
function muscleKey(week, dayName) {
  return `fitstart_muscles_w${week}_${dayName.toLowerCase().replace(/ /g,'_')}`;
}

// Day-of-week index (0=Mon) from day name — mirrors App.js restoreCompletedDayFlags
const DAY_DOW_MAP = { monday:0, tuesday:1, wednesday:2, thursday:3, friday:4, saturday:5, sunday:6 };

function loadMuscles(week, dayName, count) {
  // If the journey day-done flag is set for this (week, dow), return all-true
  const dow = DAY_DOW_MAP[dayName.toLowerCase()] ?? -1;
  if (dow !== -1 && localStorage.getItem(`fitstart_day_done_w${week}_d${dow}`) === '1') {
    const allTrue = Array(count).fill(true);
    // also persist so WorkoutDayCard's own useState picks it up next time
    localStorage.setItem(muscleKey(week, dayName), JSON.stringify(allTrue));
    return allTrue;
  }
  try {
    const arr = JSON.parse(localStorage.getItem(muscleKey(week, dayName)) || 'null');
    if (Array.isArray(arr) && arr.length === count) return arr;
  } catch {}
  return Array(count).fill(false);
}

function saveMuscles(week, dayName, arr) {
  localStorage.setItem(muscleKey(week, dayName), JSON.stringify(arr));
}

// ── Debounced server save for all workout muscle states ───────────────────────
let _workoutSaveTimer = null;
function scheduleWorkoutSave() {
  clearTimeout(_workoutSaveTimer);
  _workoutSaveTimer = setTimeout(() => {
    const token = localStorage.getItem('fitstart_token');
    if (!token) return;
    const workoutChecks = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('fitstart_muscles_')) {
        const shortKey = k.replace('fitstart_muscles_', '');
        try {
          const val = JSON.parse(localStorage.getItem(k) || 'null');
          if (Array.isArray(val) && val.some(Boolean)) workoutChecks[shortKey] = val;
        } catch (_) {}
      }
    }
    fetch(`${API_BASE}/api/auth/daily-checks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ workoutChecks }),
    }).catch(() => {});
  }, 1500);
}

// ── Week-level done flag ──────────────────────────────────────────────────────
function weekDoneKey(week) { return `fitstart_week_done_w${week}`; }
function isWeekDone(week) { return localStorage.getItem(weekDoneKey(week)) === '1'; }
function setWeekDoneFlag(week) { localStorage.setItem(weekDoneKey(week), '1'); }

// ── All week day names, slots, split data & colors imported from shared file ──

// ── Workout Day Card (with per-muscle checkboxes) ─────────────────────────────
function WorkoutDayCard({ dayData, weekIndex, dayName, accentColor, isActiveDday, onAllMusclesDone, activeRef }) {
  const count = dayData.muscles.length;
  const [muscles, setMuscles] = useState(() => loadMuscles(weekIndex, dayName, count));
  const c = COLORS[accentColor] || COLORS.cyan;
  const doneCount = muscles.filter(Boolean).length;
  const allDone = doneCount === count;

  useEffect(() => {
    setMuscles(loadMuscles(weekIndex, dayName, count));
  }, [weekIndex, dayName, count]);

  const toggle = (i) => {
    setMuscles(prev => {
      const next = [...prev];
      next[i] = !next[i];
      saveMuscles(weekIndex, dayName, next);
      scheduleWorkoutSave(); // debounce-save to server
      if (next.every(Boolean)) setTimeout(() => onAllMusclesDone(), 500);
      return next;
    });
  };

  return (
    <div
      ref={isActiveDday ? activeRef : null}
      className={`relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden
        ${allDone ? 'border-emerald-500/50 bg-[#050f0a] shadow-xl shadow-emerald-500/10' : isActiveDday ? `${c.border} bg-[#0d0d0d] shadow-lg` : 'border-white/6 bg-[#080808]'}`}
      style={isActiveDday && !allDone ? {
        boxShadow: '0 0 0 2px rgba(34,211,238,0.45), 0 0 32px rgba(34,211,238,0.12)',
      } : {}}
    >
      {/* Glow overlay when done */}
      {allDone && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-2xl" />}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dayData.emoji}</span>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${allDone ? 'text-emerald-400' : isActiveDday ? c.text : 'text-gray-600'}`}>
                {dayName} · WORKOUT {isActiveDday && !allDone && '← TODAY'}
              </p>
              <h4 className={`font-black text-lg ${allDone ? 'text-emerald-300' : 'text-white'}`}>
                {dayData.label}
                {allDone && <span className="ml-2 text-sm font-bold text-emerald-400">✓ DONE</span>}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${allDone ? 'text-emerald-400' : doneCount > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
              {doneCount}/{count}
            </p>
            <p className="text-xs text-gray-700">muscles</p>
          </div>
        </div>

        {/* Focus text */}
        <p className="text-gray-500 text-sm mb-4 pl-9">{dayData.focus}</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4 mx-0">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}`}
            style={{ width: `${count > 0 ? (doneCount/count)*100 : 0}%` }}
          />
        </div>

        {/* Muscle chips — RED = remaining, GREEN = done */}
        <div className="flex flex-wrap gap-2">
          {dayData.muscles.map((m, i) => (
            <button
              key={m}
              onClick={() => toggle(i)}
              className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all duration-200 hover:scale-105 active:scale-95 ${
                muscles[i]
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              }`}
            >
              {muscles[i] ? '✓ ' : ''}{m}
            </button>
          ))}
        </div>

        {/* Tap hint */}
        {!allDone && (
          <p className="text-gray-700 text-xs mt-3">Tap each muscle to mark it done 💪</p>
        )}

        {/* Day complete banner */}
        {allDone && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-emerald-400 font-black text-sm">🏆 {dayName} Complete! Moving to next day...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rest Day Card ─────────────────────────────────────────────────────────────
function RestDayCard({ dayName, cardIdx, weekIndex, onDone, isActive, activeRef }) {
  const card = REST_CARDS[cardIdx % REST_CARDS.length];
  const key = `fitstart_rest_done_w${weekIndex}_${dayName.toLowerCase()}`;
  const [done, setDone] = useState(() => localStorage.getItem(key) === '1');

  const toggle = () => {
    const next = !done;
    setDone(next);
    localStorage.setItem(key, next ? '1' : '0');
    if (next && onDone) setTimeout(() => onDone(), 400);
  };

  return (
    <div
      ref={isActive ? activeRef : null}
      className={`rounded-2xl border p-5 transition-all duration-300 ${done ? 'border-emerald-500/25 bg-[#050f0a]' : isActive ? 'border-cyan-500/40 bg-[#080808]' : 'border-white/6 bg-[#080808]'}`}
      style={isActive && !done ? {
        boxShadow: '0 0 0 2px rgba(34,211,238,0.35), 0 0 28px rgba(34,211,238,0.08)',
      } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">{card.emoji}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: done ? '#10b981' : card.color }}>
              {dayName} · REST DAY
            </p>
            <h4 className={`font-black text-lg mb-2 ${done ? 'text-emerald-300' : 'text-white'}`}>
              {card.type} {done && '✓'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {card.tips.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded-full border border-white/8 bg-white/3 text-gray-500">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            done ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
          }`}
        >
          {done ? '✓ Done' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
}

// ── Weekly schedule view ──────────────────────────────────────────────────────
function WeekSchedule({ activePlan, workoutDays, weekIndex, activeDayIdx, onDayDone, activeRef, restDayIdx }) {
  const slots = buildSlots(workoutDays, restDayIdx);
  let restIdx = 0;

  return (
    <div className="space-y-3">
      {ALL_DAYS.map((dayName, idx) => {
        const wSlot = slots.indexOf(idx);
        const isWorkout = wSlot !== -1;
        const isActive = idx === activeDayIdx;

        if (isWorkout) {
          return (
            <WorkoutDayCard
              key={`${weekIndex}-${dayName}`}
              dayData={activePlan.days[wSlot]}
              weekIndex={weekIndex}
              dayName={dayName}
              accentColor={activePlan.accentColor}
              isActiveDday={isActive}
              onAllMusclesDone={() => onDayDone(idx)}
              activeRef={activeRef}
            />
          );
        } else {
          return (
            <RestDayCard
              key={`${weekIndex}-${dayName}`}
              dayName={dayName}
              cardIdx={restIdx++}
              weekIndex={weekIndex}
              onDone={() => onDayDone(idx)}
            />
          );
        }
      })}
    </div>
  );
}

// ── Plan Card (selection step) ────────────────────────────────────────────────
function PlanCard({ plan, isSelected, onSelect }) {
  const c = COLORS[plan.accentColor] || COLORS.cyan;
  return (
    <div onClick={onSelect} className={`relative flex-1 p-6 bg-[#0d0d0d] border rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? `${c.border} shadow-2xl ${c.glow}` : 'border-white/5 hover:border-white/15'}`}>
      {isSelected && <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${c.grad} rounded-3xl`} />}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-widest ${c.text} mb-1 block`}>{isSelected ? '✓ Selected' : `Plan ${plan.id}`}</span>
          <h3 className="text-white font-black text-xl">{plan.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{plan.tagline}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {plan.days.map((d, i) => (
          <span key={i} className={`text-xs px-3 py-1 rounded-full border ${isSelected ? c.badge : 'bg-white/3 border-white/5 text-gray-500'}`}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Change Rest Day Flow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// 3-step animated sequence:
//  Phase A (3s): "Default Rest Day: Sunday" \u2014 pulsing neon text
//  Phase B (user-driven): "Select the day you want as rest day" + day buttons
//  Phase C: User clicks day \u2192 clicks OK \u2192 onConfirm(day)
function ChangeRestDayFlow({ currentRestDay, onConfirm, onCancel }) {
  const [phase, setPhase]         = useState('A');       // 'A' | 'B'
  const [selected, setSelected]   = useState(currentRestDay);
  const [anim, setAnim]           = useState(false);     // triggers text swap animation

  // Auto-advance Phase A \u2192 B after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setAnim(true);
      // Small delay so the fade-out plays before swapping content
      setTimeout(() => { setPhase('B'); setAnim(false); }, 350);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn .25s ease both',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'linear-gradient(145deg, #08101e, #050d18)',
          border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: '28px',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(34,211,238,0.08)',
          overflow: 'hidden',
          animation: 'slideUp .35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Top neon bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #22d3ee, #818cf8, #ec4899)' }} />

        <div style={{ padding: '32px 28px 28px' }}>

          {/* Phase A \u2014 Default Rest Day announcement */}
          {phase === 'A' && (
            <div style={{ textAlign: 'center', opacity: anim ? 0 : 1, transition: 'opacity .3s ease' }}>
              <div style={{
                fontSize: '48px', marginBottom: '16px',
                filter: 'drop-shadow(0 0 24px rgba(34,211,238,0.6))',
                animation: 'pulse 2s infinite',
              }}>🌙</div>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '.18em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                marginBottom: '10px',
              }}>Rest Day Configuration</p>
              <h2 style={{
                fontSize: '22px', fontWeight: 900, color: '#fff',
                marginBottom: '12px', letterSpacing: '-0.5px',
              }}>Default Rest Day</h2>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px', borderRadius: '99px',
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.35)',
                boxShadow: '0 0 30px rgba(34,211,238,0.2)',
                animation: 'glowPulse 2s ease infinite',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#22d3ee', letterSpacing: '0.02em' }}>
                  {currentRestDay}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '16px' }}>
                Changing in a moment...
              </p>
            </div>
          )}

          {/* Phase B \u2014 Day selector */}
          {phase === 'B' && (
            <div style={{ opacity: anim ? 0 : 1, transition: 'opacity .3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🗓️</div>
                <h2 style={{
                  fontSize: '20px', fontWeight: 900, color: '#fff',
                  marginBottom: '6px', letterSpacing: '-0.3px',
                }}>Select Your Rest Day</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                  This day will be reserved exclusively for recovery
                </p>
              </div>

              {/* Day grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '24px' }}>
                {ALL_DAYS.map(day => {
                  const isSelected = day === selected;
                  const isCurrent  = day === currentRestDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelected(day)}
                      style={{
                        padding: '10px 6px', borderRadius: '14px',
                        border: isSelected
                          ? '1px solid rgba(34,211,238,0.6)'
                          : isCurrent
                          ? '1px solid rgba(139,92,246,0.4)'
                          : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected
                          ? 'rgba(34,211,238,0.12)'
                          : isCurrent
                          ? 'rgba(139,92,246,0.07)'
                          : 'rgba(255,255,255,0.03)',
                        color: isSelected ? '#22d3ee' : isCurrent ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                        fontSize: '12px', fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer', transition: 'all .2s',
                        boxShadow: isSelected ? '0 0 20px rgba(34,211,238,0.2)' : 'none',
                        textAlign: 'center', lineHeight: 1.3,
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '3px' }}>
                        {isSelected ? '✓' : isCurrent ? '★' : ''}
                      </div>
                      {day.slice(0, 3)}
                      {isCurrent && !isSelected && (
                        <div style={{ fontSize: '8px', color: '#a78bfa', marginTop: '2px', fontWeight: 700 }}>CURRENT</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1, padding: '13px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  Cancel
                </button>
                <button
                  onClick={() => selected && onConfirm(selected)}
                  disabled={!selected || selected === currentRestDay}
                  style={{
                    flex: 2, padding: '13px', borderRadius: '14px', border: 'none',
                    background: selected && selected !== currentRestDay
                      ? 'linear-gradient(135deg, #22d3ee, #818cf8)'
                      : 'rgba(255,255,255,0.05)',
                    color: selected && selected !== currentRestDay ? '#fff' : 'rgba(255,255,255,0.2)',
                    fontSize: '14px', fontWeight: 800,
                    cursor: selected && selected !== currentRestDay ? 'pointer' : 'not-allowed',
                    transition: 'all .2s',
                    boxShadow: selected && selected !== currentRestDay ? '0 6px 24px rgba(34,211,238,0.3)' : 'none',
                  }}
                  onMouseEnter={e => { if (selected && selected !== currentRestDay) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {selected && selected !== currentRestDay
                    ? `✓ Set ${selected} as Rest Day`
                    : 'Select a different day'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline keyframes for this modal */}
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 30px rgba(34,211,238,0.2)} 50%{box-shadow:0 0 50px rgba(34,211,238,0.45)} }
      `}</style>
    </div>
  );
}

// ── Main WorkoutPage ──────────────────────────────────────────────────────────
export default function WorkoutPage({ userInfo }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('loading');       // loading | select-days | choose-plan | view-plan
  const [daysInput, setDaysInput] = useState('');
  const [days, setDays] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [inputError, setInputError] = useState('');
  const [saving, setSaving] = useState(false);
  const [, setSaveSuccess] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [weekComplete, setWeekComplete] = useState(false);
  const [, forceUpdate] = useState(0);
  const [storageVersion, setStorageVersion] = useState(0); // bumped on journey-day sync

  // Rest day state — loaded from DB (via userInfo) or localStorage
  const [restDay,    setRestDay]    = useState('Sunday');  // display name, e.g. 'Sunday'
  const [restDayIdx, setRestDayIdx] = useState(6);         // 0-6 index used by buildSlots
  const [showRestDayFlow, setShowRestDayFlow] = useState(false);
  const [savingRestDay,   setSavingRestDay]   = useState(false);

  // Ref for auto-scrolling to the active day card
  const activeDayRef = useRef(null);

  // Auto-scroll to the active day card whenever the active day or week changes
  useEffect(() => {
    if (!activeDayRef.current) return;
    const timer = setTimeout(() => {
      activeDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350); // brief delay so the schedule has animated in
    return () => clearTimeout(timer);
  }, [activeDayIdx, activeWeek]);

  // Re-render WorkoutDayCards instantly when a journey day is completed from StreakPage
  useSyncListener(useCallback(() => setStorageVersion(v => v + 1), []));

  // On mount: check if plan already saved → skip setup, go directly to schedule
  useEffect(() => {
    setTotalWeeks(getJourneyWeeks());
    const savedDays   = userInfo?.preferences?.workoutDays   || parseInt(localStorage.getItem('fitstart_workout_days') || '', 10) || null;
    const savedPlanId = userInfo?.preferences?.workoutPlanId || localStorage.getItem('fitstart_workout_plan') || null;

    // ── Restore restDay from DB preference or localStorage ──────────────────
    const savedRestDay = userInfo?.preferences?.restDay || localStorage.getItem('fitstart_rest_day') || 'Sunday';
    const savedRestIdx = DAY_INDEX[savedRestDay] ?? 6;
    setRestDay(savedRestDay);
    setRestDayIdx(savedRestIdx);

    // Skip setup if BOTH plan values exist
    if (savedDays && savedPlanId) {
      setDays(savedDays);
      setSelectedPlan(savedPlanId);

      const tw = getJourneyWeeks();
      let targetWeek = 0;
      try {
        const streak = JSON.parse(localStorage.getItem('fitstart_streak') || '{}');
        const completedCount = (streak.completedDays || []).length;
        // Journey week = which 7-day block the user is currently in (0-based)
        const journeyWeek = completedCount > 0
          ? Math.floor((completedCount - 1) / 7)   // week of the LAST completed day
          : 0;
        targetWeek = Math.min(journeyWeek, tw - 1); // safety cap
      } catch (_) {
        // Fallback: find first week WorkoutPage considers incomplete
        for (let w = 0; w < tw; w++) {
          if (!isWeekDone(w)) { targetWeek = w; break; }
        }
      }

      setActiveWeek(targetWeek);
      setStep('view-plan');
    } else {
      setStep('select-days');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-read totalWeeks whenever journey length changes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'fitstart_streak') setTotalWeeks(getJourneyWeeks());
    };
    window.addEventListener('storage', handler);
    const sameTabHandler = () => setTotalWeeks(getJourneyWeeks());
    window.addEventListener('fitstart_journey_updated', sameTabHandler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('fitstart_journey_updated', sameTabHandler);
    };
  }, []);

  const splitData  = days ? SPLITS[days] : null;
  const activePlan = selectedPlan && splitData ? splitData.plans.find(p => p.id === selectedPlan) : null;

  // Find the first uncompleted day index to highlight
  const computeActiveDay = useCallback((week) => {
    if (!activePlan) return 0;
    const s = buildSlots(days, restDayIdx);
    for (let idx = 0; idx < 7; idx++) {
      const wSlot = s.indexOf(idx);
      const dName = ALL_DAYS[idx];
      if (wSlot !== -1) {
        const ms = loadMuscles(week, dName, activePlan.days[wSlot].muscles.length);
        if (!ms.every(Boolean)) return idx;
      } else {
        const rKey = `fitstart_rest_done_w${week}_${dName.toLowerCase()}`;
        if (localStorage.getItem(rKey) !== '1') return idx;
      }
    }
    return 6; // all done
  }, [activePlan, days, restDayIdx]);

  useEffect(() => {
    if (step === 'view-plan' && activePlan) {
      setActiveDayIdx(computeActiveDay(activeWeek));
      // Check if whole week done
      let allDone = true;
      const slots = buildSlots(days, restDayIdx);
      for (let idx = 0; idx < 7; idx++) {
        const wSlot = slots.indexOf(idx);
        const dName = ALL_DAYS[idx];
        if (wSlot !== -1) {
          const ms = loadMuscles(activeWeek, dName, activePlan.days[wSlot].muscles.length);
          if (!ms.every(Boolean)) { allDone = false; break; }
        } else {
          const rKey = `fitstart_rest_done_w${activeWeek}_${dName.toLowerCase()}`;
          if (localStorage.getItem(rKey) !== '1') { allDone = false; break; }
        }
      }
      setWeekComplete(allDone);
    }
  }, [step, activeWeek, activePlan, computeActiveDay, days, restDayIdx]);

  const handleDayDone = useCallback((idx) => {
    forceUpdate(n => n + 1);
    // Advance to next incomplete day
    if (!activePlan) return;
    const s = buildSlots(days, restDayIdx);
    for (let next = idx + 1; next < 7; next++) {
      const wSlot = s.indexOf(next);
      const dName = ALL_DAYS[next];
      if (wSlot !== -1) {
        const ms = loadMuscles(activeWeek, dName, activePlan.days[wSlot].muscles.length);
        if (!ms.every(Boolean)) { setActiveDayIdx(next); return; }
      } else {
        const rKey = `fitstart_rest_done_w${activeWeek}_${dName.toLowerCase()}`;
        if (localStorage.getItem(rKey) !== '1') { setActiveDayIdx(next); return; }
      }
    }
    // All days done → week complete
    setWeekDoneFlag(activeWeek);
    setWeekComplete(true);
  }, [activePlan, days, activeWeek, restDayIdx]);

  // ── Save a new rest day to server + localStorage ──────────────────────────
  const handleRestDayConfirm = useCallback(async (newDay) => {
    const newIdx = DAY_INDEX[newDay] ?? 6;
    setRestDay(newDay);
    setRestDayIdx(newIdx);
    setShowRestDayFlow(false);
    localStorage.setItem('fitstart_rest_day', newDay);
    // Persist to user cache
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (!u.preferences) u.preferences = {};
      u.preferences.restDay = newDay;
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch (_) {}
    // PATCH to server
    const token = localStorage.getItem('fitstart_token');
    if (token) {
      setSavingRestDay(true);
      try {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ restDay: newDay }),
        });
      } catch (_) {}
      finally { setSavingRestDay(false); }
    }
  }, []);

  const goNextWeek = () => {
    const next = activeWeek + 1;
    if (next < totalWeeks) {
      setActiveWeek(next);
      setActiveDayIdx(0);
      setWeekComplete(false);
    }
  };

  // Auto-save: persist workout plan to DB + localStorage immediately
  const savePreference = async (daysVal, planIdVal) => {
    const d = daysVal ?? days;
    const p = planIdVal ?? selectedPlan;
    if (!d || !p) return;
    setSaving(true);
    // Optimistic local update first
    localStorage.setItem('fitstart_workout_days', String(d));
    localStorage.setItem('fitstart_workout_plan', p);
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (!u.preferences) u.preferences = {};
      u.preferences.workoutDays = d;
      u.preferences.workoutPlanId = p;
      u.preferences.saveWorkout = true;
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch (_) {}
    const token = localStorage.getItem('fitstart_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
          body: JSON.stringify({ workoutDays: d, workoutPlanId: p, saveWorkout: true }),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Local already saved above
    }
    finally { setSaving(false); }
  };

  const handleDaysSubmit = () => {
    const n = parseInt(daysInput);
    if (!daysInput || isNaN(n) || n < 1 || n > 6) { setInputError('Please enter 1–6'); return; }
    setInputError(''); setDays(n); setSelectedPlan(null); setStep('choose-plan');
  };

  const goBack = () => {
    if (step === 'view-plan') {
      // If plan is saved, going back goes to dashboard
      const saved = localStorage.getItem('fitstart_workout_plan');
      if (saved) { navigate('/dashboard'); return; }
      setStep('choose-plan'); return;
    }
    if (step === 'choose-plan') { setStep('select-days'); setDays(null); return; }
    navigate('/dashboard');
  };

  // Loading state
  if (step === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white animate-pulse">Loading your plan...</div></div>;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center gap-3 px-8 py-5 sticky top-0 z-40"
        style={{ background: 'rgba(5,5,15,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(0,240,255,0.08)', boxShadow: '0 1px 30px rgba(0,0,0,0.4)' }}
      >
        <button onClick={goBack} className="btn-ghost text-sm mr-1" style={{ borderRadius: '100px', padding: '8px 18px' }}>← Back</button>
        <span className="text-[#00F0FF] font-black text-xl italic tracking-tighter" style={{ textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>FITSTART</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-400">Workout Plans</span>
        {step === 'view-plan' && activePlan && (
          <>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400 text-sm">{days}d/wk · {activePlan.name.split('—')[1]?.trim()}</span>
            <span className="ml-auto text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', color: '#00F0FF', fontWeight: 700 }}>
              Week {activeWeek+1}/{totalWeeks}
            </span>
          </>
        )}
        {step === 'view-plan' && (
          <>
            <button
              onClick={async () => {
                localStorage.removeItem('fitstart_workout_days');
                localStorage.removeItem('fitstart_workout_plan');
                setDays(null); setSelectedPlan(null); setStep('select-days');
                // Also clear on server so the plan doesn't restore on next login
                const token = localStorage.getItem('fitstart_token');
                if (token) {
                  try {
                    await fetch(`${API_BASE}/api/auth/preferences`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ workoutDays: null, workoutPlanId: null, saveWorkout: false }),
                    });
                  } catch (_) {}
                }
              }}
              className="btn-glass text-xs ml-2"
              style={{ padding: '5px 12px', borderRadius: '8px' }}
              title="Change plan"
            >
              ✏️ Change
            </button>
            <button
              onClick={() => setShowRestDayFlow(true)}
              className="btn-glass text-xs ml-1"
              style={{ padding: '5px 14px', borderRadius: '99px' }}
              title="Change rest day"
            >
              {savingRestDay ? '⏳' : '🌙'} Rest: {restDay}
            </button>
          </>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── STEP 1: Select Days ── */}
        {step === 'select-days' && (
          <div>
            <div className="text-center mb-10">
              <div className="text-6xl mb-5">🏋️</div>
              <h1 className="text-4xl font-black tracking-tight mb-3">
                How many days will you{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">train?</span>
              </h1>
              <p className="text-gray-500 max-w-sm mx-auto">Pick your weekly training frequency — rest days get smart recovery plans automatically.</p>
            </div>
            <div className="grid grid-cols-6 gap-3 mb-6">
              {[1,2,3,4,5,6].map(n => (
                <button key={n} onClick={() => { setDaysInput(String(n)); setInputError(''); }}
                  className={`py-5 rounded-2xl font-black text-2xl border transition-all hover:scale-105 ${daysInput===String(n) ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-lg' : 'bg-[#0d0d0d] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-3 mb-6 -mt-1">
              {['Full\nBody','Upper\nLower','PPL','4-Day\nSplit','Bro\nSplit','PPL\nx2'].map((l,i) => (
                <p key={i} className="text-center text-[10px] text-gray-600 uppercase tracking-wider whitespace-pre-line leading-tight">{l}</p>
              ))}
            </div>
            {inputError && <p className="text-red-400 text-sm text-center mb-3">{inputError}</p>}
            <button onClick={handleDaysSubmit} disabled={!daysInput}
              className="btn-primary w-full py-4 text-lg">
              See My Plans →
            </button>
          </div>
        )}

        {/* ── STEP 2: Choose Plan ── */}
        {step === 'choose-plan' && splitData && (
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                🗓️ {days} Day{days>1?'s':''}/Week — {splitData.label}
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Pick Your Split</h1>
              <p className="text-gray-500">{splitData.description} · Select a plan and click "Save for future" on the next screen to remember your choice.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {splitData.plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} isSelected={selectedPlan===plan.id} onSelect={() => setSelectedPlan(plan.id)} />
              ))}
            </div>

            <button
              onClick={async () => {
                if (!selectedPlan) return;
                // Store plan in localStorage + auto-save to DB immediately
                setActiveWeek(0); setActiveDayIdx(0);
                setStep('view-plan');
                await savePreference(days, selectedPlan);
              }}
              disabled={!selectedPlan}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:opacity-90 disabled:opacity-30 transition-all hover:scale-[1.01]">
              {selectedPlan ? `Start My Schedule →` : 'Select a Plan First'}
            </button>
          </div>
        )}

        {/* ── STEP 3: View Schedule ── */}
        {step === 'view-plan' && activePlan && (
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-black mb-1">{activePlan.name}</h1>
              <p className="text-gray-500 text-sm">{activePlan.tagline} · {days} workout days + {7-days} rest days/week</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-white/2 border border-white/5">
              <div className="text-center">
                <p className="text-blue-400 font-black text-xl">{days}</p>
                <p className="text-gray-600 text-xs uppercase tracking-widest">Workout days</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 font-black text-xl">{7-days}</p>
                <p className="text-gray-600 text-xs uppercase tracking-widest">Rest days</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 font-black text-xl">{totalWeeks}</p>
                <p className="text-gray-600 text-xs uppercase tracking-widest">Total weeks</p>
              </div>
            </div>

            {/* Week Tabs */}
            <div className="flex gap-2 flex-wrap mb-4">
              {Array.from({length:totalWeeks},(_,i)=>i).map(w => {
                const done = isWeekDone(w);
                const isActive = w === activeWeek;
                return (
                  <button key={w} onClick={() => { setActiveWeek(w); setWeekComplete(isWeekDone(w)); forceUpdate(n=>n+1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' :
                      done ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' :
                      'bg-white/5 border border-white/8 text-gray-500 hover:text-white hover:border-white/20'
                    }`}>
                    Week {w+1}
                    {done && !isActive && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Current week label */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">
                Week {activeWeek+1} Schedule
                {weekComplete && <span className="ml-2 text-sm text-emerald-400">🎉 Complete!</span>}
              </h2>
              <span className="text-xs text-gray-600">Red = remaining · Green = done</span>
            </div>

            {/* Week complete banner */}
            {weekComplete && (
              <div className="mb-5 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-emerald-400 font-black text-lg mb-1">Week {activeWeek+1} Complete!</p>
                <p className="text-gray-500 text-sm mb-4">You crushed every session this week. Rest up and go again!</p>
                {activeWeek + 1 < totalWeeks && (
                  <button onClick={goNextWeek}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black rounded-xl hover:opacity-90 transition-all hover:scale-105">
                    Start Week {activeWeek+2} →
                  </button>
                )}
                {activeWeek + 1 >= totalWeeks && (
                  <p className="text-emerald-300 font-black text-lg">🎊 Journey Complete! You did it!</p>
                )}
              </div>
            )}

            {/* Schedule — key includes storageVersion so cards remount on journey sync */}
            {/* ── Change Rest Day Flow ─────────────────────────────────── */}
            {showRestDayFlow && (
              <ChangeRestDayFlow
                currentRestDay={restDay}
                onConfirm={handleRestDayConfirm}
                onCancel={() => setShowRestDayFlow(false)}
              />
            )}

            <WeekSchedule
              key={`schedule-${activeWeek}-${storageVersion}-${restDayIdx}`}
              activePlan={activePlan}
              workoutDays={days}
              weekIndex={activeWeek}
              activeDayIdx={activeDayIdx}
              onDayDone={handleDayDone}
              activeRef={activeDayRef}
              restDayIdx={restDayIdx}
            />

            {/* Auto-saved status badge */}
            <div className="mt-6 p-4 rounded-2xl border border-emerald-500/20"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04))' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{saving ? '⏳' : '✅'}</span>
                <div>
                  <p className="text-sm font-bold text-emerald-400">
                    {saving ? 'Saving plan…' : 'Plan saved — your schedule loads automatically next login'}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    To switch plans, use the ✏️ Change button above
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
