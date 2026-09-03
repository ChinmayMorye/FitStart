import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDietForDay, getWorkoutInfoForDay, getDayName } from '../utils/journeyHelpers';
import { REST_CARDS } from '../data/workoutData';
import { useJourney } from '../context/JourneyContext';
import AppreciationModal from '../components/AppreciationModal';

const API_BASE = process.env.REACT_APP_API_URL || '';

// ── Confetti burst helper ──────────────────────────────────────────────────
function ConfettiPop({ x, y }) {
  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {['🎉', '⭐', '💥', '✨', '🔥'].map((e, i) => (
        <span
          key={i}
          className="absolute text-xl"
          style={{
            animation: `pop 0.7s ease-out forwards`,
            transform: `rotate(${i * 72}deg) translateY(-40px)`,
            animationDelay: `${i * 0.06}s`,
          }}
        >{e}</span>
      ))}
    </div>
  );
}

// ── Road Node ──────────────────────────────────────────────────────────────
// Each node shows:
//   • The circle button: emoji + "Day N" (or Start / Goal)
//   • Below the circle: full weekday name — e.g. "Saturday"
// Together this gives the user the complete "Day 9 — Saturday" context at a glance.
function DayNode({ day, totalDays, isCompleted, isCurrent, isLocked, onClick, startDate }) {
  const isFirst = day === 1;
  const isLast  = day === totalDays;
  const emoji   = isFirst ? '🚀' : isLast ? '🏆' : isCompleted ? '✅' : isCurrent ? '🔥' : '🔒';

  // Full weekday name anchored to user's journey start date
  const weekday = startDate ? getDayName(day, startDate) : null;

  const ring = isCurrent
    ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-black scale-110'
    : isCompleted ? 'ring-2 ring-emerald-500/60' : 'ring-1 ring-white/10';

  const bg = isCompleted
    ? 'bg-gradient-to-br from-emerald-600 to-cyan-600'
    : isCurrent ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
    : isFirst   ? 'bg-gradient-to-br from-purple-600 to-blue-600'
    : isLast    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
    : 'bg-[#1a1a1a] border border-white/10';

  const textColor = isCompleted || isCurrent || isFirst || isLast ? 'text-white' : 'text-gray-600';

  // Colour tokens for the sub-labels
  const dayNumColor  = isCurrent ? '#22d3ee'  : isCompleted ? '#34d399'  : 'rgba(255,255,255,0.35)';
  const weekdayColor = isCurrent ? '#00f2ff'  : isCompleted ? '#6ee7b7'  : 'rgba(255,255,255,0.22)';

  return (
    <div className="flex flex-col items-center" style={{ gap: '4px', minWidth: '52px' }}>
      {/* ── Circle button ── */}
      <button
        onClick={() => !isLocked && onClick(day)}
        disabled={isLocked}
        className={`
          relative flex flex-col items-center justify-center
          w-14 h-14 rounded-full shrink-0
          ${bg} ${ring} ${textColor}
          transition-all duration-300
          ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'}
          shadow-lg
          ${isCurrent ? 'shadow-cyan-500/50' : isCompleted ? 'shadow-emerald-500/30' : ''}
        `}
      >
        <span className="text-lg leading-none">{emoji}</span>
      </button>

      {/* ── "Day N" label ── */}
      <span
        style={{
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: dayNumColor,
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        {isFirst ? 'Start' : isLast ? 'Goal' : `Day ${day}`}
      </span>

      {/* ── Full weekday name label — shown on EVERY node ── */}
      {weekday && (
        <span
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: weekdayColor,
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {weekday}
        </span>
      )}
    </div>
  );
}

// ── Journey Controller Modal ──────────────────────────────────────────────────
const PRESETS = [7, 14, 21, 30, 45, 60, 75, 90];

function JourneyControllerModal({ currentTotal, onClose, onSave, saving }) {
  const [input, setInput] = React.useState(String(currentTotal || ''));
  const [error, setError] = React.useState('');
  const parsed = parseInt(input);
  const valid  = !isNaN(parsed) && parsed >= 1 && parsed <= 365;

  const handleSave = () => {
    if (!valid) { setError('Enter a number between 1 and 365'); return; }
    onSave(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
           style={{ animation: 'scaleIn 0.3s cubic-bezier(.34,1.56,.64,1) both' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/5 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">⚙️ Journey Controller</h2>
              <p className="text-gray-500 text-xs mt-0.5">Change the total length of your journey</p>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xl transition-colors">✕</button>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Current info */}
          <div className="mb-5 p-3.5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Current Journey</span>
            <span className="text-cyan-400 font-black text-lg">{currentTotal} days</span>
          </div>

          {/* Preset buttons */}
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-3">Quick Select</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {PRESETS.map(p => (
              <button key={p}
                onClick={() => { setInput(String(p)); setError(''); }}
                className={`py-2.5 rounded-xl text-sm font-black border transition-all hover:scale-105 ${
                  parsed === p
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-transparent text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-[#111] border-white/8 text-gray-400 hover:border-white/25 hover:text-white'
                }`}>
                {p}d
              </button>
            ))}
          </div>

          {/* Custom input */}
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Custom (1–365 days)</p>
          <input
            type="number" min={1} max={365}
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-black outline-none focus:border-cyan-500/50 transition-colors mb-1"
            style={{ letterSpacing: '-1px' }}
          />
          {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

          {/* Warning if shortening */}
          {valid && parsed < currentTotal && (
            <div className="mt-3 mb-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400 text-xs text-center">
              ⚠️ Shortening your journey will remove completed days beyond Day {parsed}.
            </div>
          )}

          {/* Info if extending */}
          {valid && parsed > currentTotal && (
            <div className="mt-3 mb-4 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs text-center">
              ✨ Your journey will extend to {parsed} days. New nodes added instantly!
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-semibold">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!valid || saving}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-sm hover:opacity-90 disabled:opacity-30 transition-all hover:scale-[1.01] disabled:scale-100">
              {saving ? '⏳ Updating...' : `Set to ${valid ? parsed : '?'} Days →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPills({ step }) {
  const steps = ['Diet Plan', 'Workout', 'Complete'];
  const idx   = step === 'diet' ? 0 : step === 'workout-prompt' || step === 'workout' ? 1 : 2;
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            i < idx  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : i===idx ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
            : 'bg-white/3 border-white/8 text-gray-600'
          }`}>
            {i < idx ? '✓ ' : `${i+1}. `}{s}
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px ${i < idx ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main Streak Road Page ────────────────────────────────────────────────────
export default function StreakPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Pull global journey state from context ─────────────────────────────
  const {
    completedDays,
    currentStreak,
    totalDays: ctxTotalDays,
    workoutPlace: ctxWorkoutPlace,
    startDate: ctxStartDate,
    currentDay,
    progressPct,
    syncing,
    changingLength,
    completeDay,
    resetJourney,
    setTotalDays,
  } = useJourney();

  // Fall back to location state / localStorage for totalDays (e.g. first load)
  const journeyConfig = (() => {
    if (location.state?.totalDays) return location.state;
    try {
      const saved = JSON.parse(localStorage.getItem('fitstart_streak') || 'null');
      if (saved?.totalDays) return saved;
    } catch (_) {}
    return null;
  })();

  const totalDays    = ctxTotalDays    || journeyConfig?.totalDays    || 7;
  const workoutPlace = ctxWorkoutPlace?.length ? ctxWorkoutPlace : (journeyConfig?.workoutPlace || ['At Home']);

  const [confetti, setConfetti]             = useState(null);
  const [toast, setToast]                   = useState(null);
  const [selectedDay, setSelectedDay]       = useState(null);
  const [showController, setShowController] = useState(false);
  // AppreciationModal state
  const [appreciationModal, setAppreciationModal] = useState(null); // null | { type, dayNumber, weekNumber }

  // ── Multi-step modal state ─────────────────────────────────────────────
  // modalStep: null | 'diet-setup' | 'diet' | 'workout-prompt' | 'workout'
  const [modalStep,      setModalStep]      = useState(null);
  const [dietTypeChoice, setDietTypeChoice] = useState(null);
  const [dayMeals,       setDayMeals]       = useState([]);
  const [checkedMeals,   setCheckedMeals]   = useState([]);
  const [workoutInfo,    setWorkoutInfo]     = useState(null);
  const [checkedMuscles, setCheckedMuscles] = useState([]);
  const [restDone,       setRestDone]       = useState(false);
  const [savingDay,      setSavingDay]      = useState(false);
  const [dietSaving,     setDietSaving]     = useState(false);
  const [masterToggle,   setMasterToggle]   = useState(false); // ← Master Toggle state

  // Helper: read user data from localStorage
  const getUserData = () => {
    try { return JSON.parse(localStorage.getItem('fitstart_user') || '{}'); } catch { return {}; }
  };
  const getStartDate = () => ctxStartDate || getUserData()?.journeyData?.startDate || new Date().toISOString();
  // Stable value used throughout JSX (DayNode weekday labels, modal header, etc.)
  const startDate = ctxStartDate || getUserData()?.journeyData?.startDate || null;

  // ── Open modal on day click ────────────────────────────────────────────
  const handleDayClick = (day) => {
    if (day !== currentDay) return;
    setSelectedDay(day);
    setRestDone(false);
    setDietTypeChoice(null);

    const userData   = getUserData();
    const dietType   = userData?.preferences?.dietType;
    const startDate  = getUserData()?.journeyData?.startDate || new Date().toISOString();
    const wDays = parseInt(localStorage.getItem('fitstart_workout_days') || '0') || null;
    const planId= localStorage.getItem('fitstart_workout_plan') || null;

    if (!dietType) {
      // No diet type set → mandatory selection
      setModalStep('diet-setup');
    } else {
      // Load diet meals for this day
      const meals = getDietForDay(day, startDate, dietType);
      setDayMeals(meals);
      setCheckedMeals(Array(meals.length).fill(false));
      // Pre-compute workout info
      const wInfo = getWorkoutInfoForDay(day, startDate, wDays, planId);
      setWorkoutInfo(wInfo);
      if (wInfo?.type === 'workout') setCheckedMuscles(Array(wInfo.dayData.muscles.length).fill(false));
      setModalStep('diet');
    }
  };

  // ── Diet type setup: save & advance ───────────────────────────────────
  const handleSaveDietType = async () => {
    if (!dietTypeChoice) return;
    setDietSaving(true);
    const token = localStorage.getItem('fitstart_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dietType: dietTypeChoice }),
        });
      }
    } catch (_) {}

    // Update localStorage
    const userData = getUserData();
    userData.preferences = { ...(userData.preferences || {}), dietType: dietTypeChoice };
    localStorage.setItem('fitstart_user', JSON.stringify(userData));

    const startDate = userData?.journeyData?.startDate || new Date().toISOString();
    const meals = getDietForDay(selectedDay, startDate, dietTypeChoice);
    setDayMeals(meals);
    setCheckedMeals(Array(meals.length).fill(false));

    const wDays = parseInt(localStorage.getItem('fitstart_workout_days') || '0') || null;
    const planId = localStorage.getItem('fitstart_workout_plan') || null;
    const wInfo = getWorkoutInfoForDay(selectedDay, startDate, wDays, planId);
    setWorkoutInfo(wInfo);
    if (wInfo?.type === 'workout') setCheckedMuscles(Array(wInfo.dayData.muscles.length).fill(false));

    setDietSaving(false);
    setModalStep('diet');
  };

  // ── Diet confirmed → decide next step ─────────────────────────────────
  const handleDietConfirmed = () => {
    const wDays  = parseInt(localStorage.getItem('fitstart_workout_days') || '0') || null;
    const planId = localStorage.getItem('fitstart_workout_plan') || null;
    if (!wDays || !planId) {
      setModalStep('workout-prompt');
    } else {
      setModalStep('workout');
    }
  };

  // ── Master Toggle: Bottom-Up auto-sync ────────────────────────────────
  // If every chip is manually checked → toggle flips ON automatically.
  // If any chip is unchecked → toggle flips OFF automatically.
  useEffect(() => {
    if (checkedMuscles.length === 0) { setMasterToggle(false); return; }
    setMasterToggle(checkedMuscles.every(Boolean));
  }, [checkedMuscles]);

  // ── Master Toggle: Top-Down handler ───────────────────────────────────
  // Toggling ON → marks all chips done; toggling OFF → resets all chips.
  const handleMasterToggle = () => {
    const next = !masterToggle;
    setMasterToggle(next);
    setCheckedMuscles(prev => Array(prev.length).fill(next));
  };

  // ── Handle journey length change from Controller modal ─────────────────────
  const handleJourneyLengthSave = async (newTotal) => {
    if (newTotal === totalDays) { setShowController(false); return; }
    await setTotalDays(newTotal);
    setShowController(false);
    setToast(`✅ Journey updated to ${newTotal} days!`);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Final save: mark day complete ──────────────────────────────────────
  // Delegates to JourneyContext.completeDay() which:
  //  1. Optimistically updates React state (completedDays, currentStreak)
  //  2. Writes localStorage
  //  3. Calls broadcastDayComplete() → Diet & Workout pages auto-update
  //  4. POSTs to /api/auth/complete-day atomically
  const handleMarkComplete = async () => {
    const day = selectedDay;
    setSavingDay(true);
    try {
      // Capture which muscles were actually trained this session
      const workedMuscles = workoutInfo?.dayData?.muscles?.filter((_, i) => checkedMuscles[i]) || [];
      const result = await completeDay(day, {
        workoutStatus: workedMuscles.length > 0 ? 'completed' : 'rest',
        musclesWorked: workedMuscles,
        dietStatus:    'completed',
      });
      void result;

      // ── Write per-day done flags so DietPage & WorkoutPage show ✓ ─────────
      // These flags are keyed by (journey-week, day-of-week) and survive sessions.
      // App.js restores them from completedDays on every login.
      try {
        const sd = new Date(getStartDate());
        const startDow = sd.getDay() === 0 ? 6 : sd.getDay() - 1; // 0=Mon
        const weekIdx  = Math.floor((day - 1) / 7);
        const dayDow   = (startDow + day - 1) % 7;
        localStorage.setItem(`fitstart_day_done_w${weekIdx}_d${dayDow}`, '1');
        // Cheat day (Sunday = d6 in 0=Mon system)
        const dtForFlag = getUserData()?.preferences?.dietType;
        if (dtForFlag && dayDow === 6) {
          localStorage.setItem(`fitstart_cheat_${dtForFlag}_w${weekIdx}_d6`, '1');
        }
        // Rest day done flag (WorkoutPage format)
        const restDayName = localStorage.getItem('fitstart_rest_day') || 'Sunday';
        const restDayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        if (restDayNames[dayDow] === restDayName) {
          localStorage.setItem(`fitstart_rest_done_w${weekIdx}_${restDayName.toLowerCase()}`, '1');
        }
      } catch (_) {}

      // ── Persist lastCompletedDay to preferences ────────────────────────
      const token = localStorage.getItem('fitstart_token');
      if (token) {
        fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lastCompletedDay: day }),
        }).catch(() => {});
      }

      // Close modal + reset master toggle
      setSelectedDay(null);
      setModalStep(null);
      setMasterToggle(false);

      // ── AppreciationModal: weekly (every 7th day) or daily ──────────────
      const isWeekEnd = day % 7 === 0;
      const weekNum   = Math.ceil(day / 7);
      setAppreciationModal(
        isWeekEnd
          ? { type: 'weekly',  dayNumber: day, weekNumber: weekNum }
          : { type: 'daily',   dayNumber: day, weekNumber: weekNum }
      );

      // Confetti burst
      setConfetti({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setTimeout(() => setConfetti(null), 1200);

      if (day === totalDays) {
        setToast('🏆 YOU DID IT! All days completed!');
        setTimeout(() => setToast(null), 4000);
      }
    } finally {
      setSavingDay(false);
    }
  };

  // ── Close / cancel modal ───────────────────────────────────────────────
  const closeModal = () => {
    setSelectedDay(null);
    setModalStep(null);
    setDietTypeChoice(null);
    setDayMeals([]);
    setCheckedMeals([]);
    setWorkoutInfo(null);
    setCheckedMuscles([]);
    setRestDone(false);
    setMasterToggle(false);
  };

  // ── Reset journey — delegates to context ──────────────────────────────
  const handleReset = async () => {
    await resetJourney();
    setToast("🔄 Journey reset! Let's go again!");
    setTimeout(() => setToast(null), 3000);
  };

  // ── Build zigzag rows ──────────────────────────────────────────────────
  // Each row also carries a `weekComplete` flag for green highlighting.
  //
  // Week-complete logic: A row is highlighted green when ALL 7 days of
  // the calendar week that contains the row's highest-numbered day are
  // present in completedDays.
  //   weekNumber  = Math.ceil(maxDayInRow / 7)         (1-based)
  //   weekStart   = weekNumber * 7 - 6                 (e.g. 1, 8, 15 …)
  //   weekEnd     = weekNumber * 7                     (e.g. 7, 14, 21 …)
  // All 7 days [weekStart … weekEnd] must be <= totalDays AND completed.
  const rows = [];
  let remaining = Array.from({ length: totalDays }, (_, i) => i + 1);
  let rowIdx = 0;
  while (remaining.length > 0) {
    const chunk = remaining.splice(0, 4);
    const sortedChunk = [...chunk].sort((a, b) => a - b);
    const maxDay = sortedChunk[sortedChunk.length - 1];
    const weekNumber = Math.ceil(maxDay / 7);
    const weekStart  = weekNumber * 7 - 6;
    const weekEnd    = weekNumber * 7;
    const weekDays   = Array.from({ length: 7 }, (_, i) => weekStart + i);
    const isFullWeekRow =
      weekEnd <= totalDays &&
      weekDays.every(d => completedDays.includes(d));
    rows.push({
      days: rowIdx % 2 === 0 ? chunk : [...chunk].reverse(),
      direction: rowIdx % 2,
      weekComplete: isFullWeekRow,
      weekNumber,
    });
    rowIdx++;
  }

  // Computed helpers for modal
  const dayName       = selectedDay ? getDayName(selectedDay, getStartDate()) : '';
  const allMealsChecked  = checkedMeals.length > 0 && checkedMeals.every(Boolean);
  const allMusclesDone   = checkedMuscles.length > 0 && checkedMuscles.every(Boolean);
  const workoutStepDone  = workoutInfo?.type === 'workout' ? allMusclesDone : restDone;

  // Current rest card for rest day
  const restCard = REST_CARDS[(selectedDay || 1) % REST_CARDS.length];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes pop {
          0%   { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(-10px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-80px) scale(0.5); }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down { animation: slideDown 0.35s ease-out both; }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-up { animation: fadeInUp 0.5s ease-out both; }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {confetti && <ConfettiPop x={confetti.x} y={confetti.y} />}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-[#111] border border-white/10 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold">
            {toast}
          </div>
        </div>
      )}

      {syncing && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#111] border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="animate-pulse">●</span> Saving...
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MULTI-STEP VERIFICATION MODAL
          Steps: diet-setup → diet → workout-prompt → workout
      ══════════════════════════════════════════════════════════════════ */}
      {selectedDay && modalStep && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <div className="rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden"
          style={{ background: 'rgba(8,10,22,0.97)', border: '1px solid rgba(0,240,255,0.12)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,240,255,0.05)' }}>

            {/* ── Modal header band ── */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-white/5 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Day {selectedDay} of {totalDays}
                  {dayName && ` — ${dayName}`}
                </span>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-300 text-xl leading-none transition-colors"
                >✕</button>
              </div>
              {modalStep !== 'diet-setup' && <StepPills step={modalStep} />}
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">

              {/* ══ STEP 0: Diet Type Setup ══════════════════════════════ */}
              {modalStep === 'diet-setup' && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🥗</div>
                    <h2 className="text-xl font-black mb-2">Choose Your Diet Style</h2>
                    <p className="text-gray-500 text-sm">
                      You haven't selected a diet type yet. Pick one below — it will be saved and used throughout your journey.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: 'veg',    emoji: '🥗', label: 'Vegetarian',     sub: 'Dal, Paneer, Pulses & Grains' },
                      { id: 'nonveg', emoji: '🍗', label: 'Non-Vegetarian', sub: 'Chicken, Eggs, Fish & More' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDietTypeChoice(opt.id)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center ${
                          dietTypeChoice === opt.id
                            ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                            : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-3xl mb-2">{opt.emoji}</div>
                        <div className="font-black text-sm text-white mb-1">{opt.label}</div>
                        <div className="text-gray-500 text-xs">{opt.sub}</div>
                        {dietTypeChoice === opt.id && (
                          <div className="mt-2 text-xs font-bold text-cyan-400">✓ Selected</div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-400 text-xs text-center mb-5">
                    ⚠️ This preference will be saved permanently. You can change it later from your profile.
                  </div>

                  <button
                    onClick={handleSaveDietType}
                    disabled={!dietTypeChoice || dietSaving}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm hover:opacity-90 disabled:opacity-30 transition-all hover:scale-[1.01] disabled:scale-100"
                  >
                    {dietSaving ? '⏳ Saving...' : 'Save & Start Diet Check →'}
                  </button>
                </div>
              )}

              {/* ══ STEP 1: Diet Checklist ════════════════════════════════ */}
              {modalStep === 'diet' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-black">📋 Diet Plan</h2>
                      <p className="text-gray-500 text-xs mt-0.5">Confirm each meal slot you completed today</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${allMealsChecked ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {checkedMeals.filter(Boolean).length}/{dayMeals.length}
                      </span>
                      <p className="text-gray-600 text-xs">meals</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${dayMeals.length > 0 ? (checkedMeals.filter(Boolean).length / dayMeals.length) * 100 : 0}%` }}
                    />
                  </div>

                  {dayMeals.length === 0 ? (
                    <p className="text-gray-500 text-center py-6 text-sm">No meal data available for this day.</p>
                  ) : (
                    <div className="space-y-2 mb-5">
                      {dayMeals.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => setCheckedMeals(prev => {
                            const next = [...prev];
                            next[i] = !next[i];
                            return next;
                          })}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                            checkedMeals[i]
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                            checkedMeals[i]
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-white/20 text-transparent'
                          }`}>
                            {checkedMeals[i] ? '✓' : ''}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{slot.icon}</span>
                              <span className={`font-bold text-sm ${checkedMeals[i] ? 'text-emerald-300' : 'text-white'}`}>{slot.meal}</span>
                            </div>
                            <p className="text-gray-600 text-xs mt-0.5 ml-7">{slot.time}</p>
                            {slot.items && slot.items.length > 0 && (
                              <p className="text-gray-500 text-xs mt-0.5 ml-7 truncate">
                                {slot.items.slice(0, 2).map(it => it.name).join(' · ')}
                                {slot.items.length > 2 && ` +${slot.items.length - 2} more`}
                              </p>
                            )}
                          </div>
                          {checkedMeals[i] && <span className="text-emerald-400 text-xs font-bold shrink-0">Done!</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {!allMealsChecked && (
                    <p className="text-gray-600 text-xs text-center mb-4">
                      ☝️ Tap each meal slot to confirm you completed it
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors text-sm font-semibold"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleDietConfirmed}
                      disabled={!allMealsChecked}
                      className="flex-[2] py-3 rounded-xl text-white font-black text-sm disabled:opacity-30 transition-all hover:scale-[1.01] disabled:scale-100"
                      style={allMealsChecked ? { background: 'linear-gradient(135deg, #10b981, #22d3ee)', boxShadow: '0 8px 25px rgba(16,185,129,0.35)' } : { background: 'rgba(255,255,255,0.06)' }}
                    >
                      {allMealsChecked ? 'Confirm Diet ✓ →' : `Check all ${dayMeals.length} meals first`}
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 2a: No Workout Plan Set ═════════════════════════ */}
              {modalStep === 'workout-prompt' && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🏋️</div>
                    <h2 className="text-xl font-black mb-2">Workout Plan Not Set</h2>
                    <p className="text-gray-500 text-sm">
                      You haven't configured a workout plan yet. Would you like to set one up, or track diet-only for today?
                    </p>
                  </div>

                  <div className="space-y-3 mb-5">
                    <button
                      onClick={() => navigate('/workout')}
                      className="w-full p-4 rounded-2xl border-2 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15 transition-all text-left flex items-center gap-4"
                    >
                      <span className="text-3xl">🏋️</span>
                      <div>
                        <div className="font-black text-white text-sm">Set Up Workout Plan</div>
                        <div className="text-gray-500 text-xs mt-0.5">Choose your split, days, and exercises — takes 1 min</div>
                      </div>
                      <span className="ml-auto text-blue-400 text-lg">→</span>
                    </button>

                    <button
                      onClick={handleMarkComplete}
                      disabled={savingDay}
                      className="w-full p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/8 hover:bg-emerald-500/12 transition-all text-left flex items-center gap-4"
                    >
                      <span className="text-3xl">🥗</span>
                      <div>
                        <div className="font-black text-emerald-300 text-sm">Diet Only — Complete Day</div>
                        <div className="text-gray-500 text-xs mt-0.5">Mark today done based on diet alone</div>
                      </div>
                      {savingDay
                        ? <span className="ml-auto text-emerald-400 text-sm animate-pulse">Saving...</span>
                        : <span className="ml-auto text-emerald-400 text-lg">✓</span>
                      }
                    </button>
                  </div>

                  <button
                    onClick={() => setModalStep('diet')}
                    className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    ← Back to diet checklist
                  </button>
                </div>
              )}

              {/* ══ STEP 2b: Workout Checklist ════════════════════════════ */}
              {modalStep === 'workout' && workoutInfo && (
                <div>
                  {workoutInfo.type === 'workout' ? (
                    <>
                      {/* ── Header + live counter ───────────────────────────── */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="text-xl font-black">💪 Workout</h2>
                          <p className="text-gray-500 text-xs mt-0.5">{workoutInfo.dayData.label} — {workoutInfo.dayData.focus}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className="text-lg font-black transition-colors duration-300"
                            style={{ color: allMusclesDone ? '#00ff88' : '#00f2ff' }}
                          >
                            {checkedMuscles.filter(Boolean).length}/{workoutInfo.dayData.muscles.length}
                          </span>
                          <p className="text-gray-600 text-xs">exercises done</p>
                        </div>
                      </div>

                      {/* ── Animated progress bar ───────────────────────────── */}
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${workoutInfo.dayData.muscles.length > 0
                              ? (checkedMuscles.filter(Boolean).length / workoutInfo.dayData.muscles.length) * 100
                              : 0}%`,
                            background: allMusclesDone
                              ? 'linear-gradient(90deg,#00ff88,#00f2ff)'
                              : 'linear-gradient(90deg,#3b82f6,#10b981)',
                            boxShadow: allMusclesDone ? '0 0 12px rgba(0,255,136,0.5)' : 'none',
                          }}
                        />
                      </div>

                      {/* ══ MASTER TOGGLE ══════════════════════════════════════ */}
                      <div
                        className="flex items-center justify-between mb-4 px-4 py-3 rounded-2xl border transition-all duration-300"
                        style={{
                          background: masterToggle
                            ? 'linear-gradient(135deg,rgba(0,255,136,0.07),rgba(0,242,255,0.07))'
                            : 'rgba(255,255,255,0.03)',
                          borderColor: masterToggle ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)',
                          boxShadow: masterToggle
                            ? '0 0 28px rgba(0,255,136,0.08), inset 0 1px 0 rgba(0,255,136,0.1)'
                            : 'none',
                        }}
                      >
                        {/* Left: icon + label */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 transition-all duration-300"
                            style={{
                              background: masterToggle ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${masterToggle ? 'rgba(0,255,136,0.35)' : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            {masterToggle ? '⚡' : '💡'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white leading-tight">Mark All as Completed</p>
                            <p
                              className="text-xs mt-0.5 transition-colors duration-300"
                              style={{ color: allMusclesDone ? '#00ff88' : '#4b5563' }}
                            >
                              {allMusclesDone
                                ? '🎯 All exercises done — ready!'
                                : `${checkedMuscles.filter(Boolean).length} of ${workoutInfo.dayData.muscles.length} checked`}
                            </p>
                          </div>
                        </div>

                        {/* Right: pill toggle switch */}
                        <button
                          onClick={handleMasterToggle}
                          aria-label="Mark all exercises complete"
                          className="relative shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
                          style={{
                            background: masterToggle
                              ? 'linear-gradient(90deg,#00ff88,#00f2ff)'
                              : 'rgba(255,255,255,0.12)',
                            boxShadow: masterToggle ? '0 0 20px rgba(0,255,136,0.55)' : 'none',
                          }}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full shadow-lg transition-all duration-300"
                            style={{
                              left: masterToggle ? '26px' : '2px',
                              background: masterToggle ? '#fff' : 'rgba(255,255,255,0.45)',
                              boxShadow: masterToggle ? '0 2px 8px rgba(0,0,0,0.35)' : 'none',
                            }}
                          />
                        </button>
                      </div>

                      {/* ── Instruction hint ────────────────────────────────── */}
                      <p className="text-gray-600 text-xs mb-3">
                        Or tap individual muscle groups below:
                      </p>

                      {/* ── Muscle group chips ──────────────────────────────── */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {workoutInfo.dayData.muscles.map((m, i) => (
                          <button
                            key={m}
                            onClick={() => setCheckedMuscles(prev => {
                              const next = [...prev];
                              next[i] = !next[i];
                              return next;
                            })}
                            className="text-sm px-4 py-2 rounded-full border font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{
                              background: checkedMuscles[i] ? 'rgba(0,255,136,0.12)' : 'rgba(239,68,68,0.08)',
                              borderColor: checkedMuscles[i] ? 'rgba(0,255,136,0.4)' : 'rgba(239,68,68,0.3)',
                              color: checkedMuscles[i] ? '#00ff88' : '#f87171',
                              boxShadow: checkedMuscles[i] ? '0 0 12px rgba(0,255,136,0.18)' : 'none',
                            }}
                          >
                            {checkedMuscles[i] ? '✓ ' : ''}{m}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Rest day
                    <div>
                      <h2 className="text-xl font-black mb-1">😴 Rest Day</h2>
                      <p className="text-gray-500 text-sm mb-4">Today is your scheduled rest day. Recovery is just as important as training!</p>
                      <div className="p-4 rounded-2xl border border-white/8 bg-white/3 mb-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{restCard.emoji}</span>
                          <div>
                            <p className="font-black text-white text-sm">{restCard.type}</p>
                            <p className="text-gray-500 text-xs">Optional recovery activities</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {restCard.tips.map(t => (
                            <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-white/8 bg-white/3 text-gray-400">{t}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setRestDone(d => !d)}
                        className={`w-full py-3 rounded-xl border-2 font-bold text-sm transition-all mb-4 ${
                          restDone
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/3 border-white/15 text-gray-300 hover:border-white/30'
                        }`}
                      >
                        {restDone ? '✓ Rest Day Acknowledged' : 'Acknowledge Rest Day'}
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalStep('diet')}
                      className="btn-ghost flex-1 py-3 text-sm"
                      style={{ borderRadius: '12px' }}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleMarkComplete}
                      disabled={!workoutStepDone || savingDay}
                      className="flex-[2] py-3 rounded-xl text-white font-black text-sm disabled:opacity-30 transition-all hover:scale-[1.01] disabled:scale-100"
                      style={workoutStepDone && !savingDay ? { background: 'linear-gradient(135deg, #22d3ee, #10b981)', boxShadow: '0 8px 25px rgba(34,211,238,0.4)' } : { background: 'rgba(255,255,255,0.06)' }}
                    >
                      {savingDay ? '⏳ Saving...' : workoutStepDone ? '🏆 Complete Day!' : 'Finish workout first'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Journey Controller Modal */}
      {showController && (
        <JourneyControllerModal
          currentTotal={totalDays}
          onClose={() => setShowController(false)}
          onSave={handleJourneyLengthSave}
          saving={changingLength}
        />
      )}

      {/* AppreciationModal — daily or weekly celebration */}
      {appreciationModal && (
        <AppreciationModal
          type={appreciationModal.type}
          dayNumber={appreciationModal.dayNumber}
          weekNumber={appreciationModal.weekNumber}
          onClose={() => setAppreciationModal(null)}
        />
      )}

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 sticky top-0 z-30"
        style={{ background: 'rgba(5,5,15,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(0,240,255,0.08)', boxShadow: '0 1px 30px rgba(0,0,0,0.4)' }}
      >
        <span className="text-[#00F0FF] font-black text-2xl italic tracking-tighter" style={{ textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>FITSTART</span>
        <div className="flex items-center gap-3">
          {/* Journey Controller button */}
          <button
            onClick={() => setShowController(true)}
            title="Edit journey length"
            className="btn-glass flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            style={{ borderRadius: '12px' }}
          >
            ⚙️ <span className="hidden sm:inline">Journey</span> {totalDays}d
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost text-sm flex items-center gap-2 px-4 py-2"
            style={{ borderRadius: '100px', padding: '8px 18px' }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <p className="text-cyan-400 text-xs uppercase tracking-[0.3em] mb-3">Your Fitness Journey</p>
          <h1 className="text-4xl font-black mb-2">
            The Road to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Day {totalDays}
            </span>
          </h1>
          <p className="text-gray-500 text-sm">
            Workout: <span className="text-cyan-400 font-semibold">{workoutPlace.join(' & ')}</span>
            {' · '}
            <span className="text-emerald-400">{completedDays.length}/{totalDays} days done</span>
            {currentStreak > 0 && (
              <span className="text-orange-400 ml-2">🔥 {currentStreak}-day streak</span>
            )}
          </p>
          <button
            onClick={() => setShowController(true)}
            className="mt-2 text-xs text-gray-700 hover:text-purple-400 transition-colors underline underline-offset-2"
          >
            ✏️ Change journey length
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span className="text-cyan-400 font-bold">{progressPct}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Road Map */}
        <div className="space-y-4">
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="animate-fade-up"
              style={{ animationDelay: `${0.15 + rIdx * 0.07}s` }}
            >
              {/* ── Week-complete green highlight wrapper ── */}
              <div
                style={row.weekComplete ? {
                  borderRadius: '18px',
                  padding: '10px 8px 6px',
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.07)',
                  marginBottom: '2px',
                  position: 'relative',
                } : {}}
              >
                {/* Conquered badge */}
                {row.weekComplete && (
                  <div style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg,#10b981,#06b6d4)',
                    borderRadius: '100px',
                    padding: '2px 12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    ✓ Week Conquered
                  </div>
                )}

                <div className={`flex items-end justify-between gap-2 ${
                  row.direction === 1 ? 'flex-row-reverse' : ''
                }`}>
                  {row.days.map((day, dIdx) => (
                    <React.Fragment key={day}>
                      <DayNode
                        day={day}
                        totalDays={totalDays}
                        isCompleted={completedDays.includes(day)}
                        isCurrent={day === currentDay && !completedDays.includes(day)}
                        isLocked={day > currentDay && !completedDays.includes(day)}
                        onClick={handleDayClick}
                        startDate={startDate}
                      />
                      {dIdx < row.days.length - 1 && (
                        <div
                          className={`flex-1 rounded-full transition-all duration-500`}
                          style={{
                            height: '4px',
                            marginBottom: '28px', // align with node center (above weekday label)
                            background:
                              completedDays.includes(day) && completedDays.includes(row.days[dIdx + 1])
                                ? 'linear-gradient(90deg,#10b981,#22d3ee)'
                                : completedDays.includes(day)
                                ? 'linear-gradient(90deg,rgba(16,185,129,0.6),rgba(255,255,255,0.06))'
                                : 'rgba(255,255,255,0.05)',
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {rIdx < rows.length - 1 && (
                <div className={`flex ${
                  row.direction === 0 ? 'justify-end' : 'justify-start'
                } my-1 px-6`}>
                  <div className={`w-8 h-8 border-2 rounded-b-full ${
                    completedDays.includes(rows[rIdx].days[rows[rIdx].days.length - 1])
                      ? 'border-emerald-500/50' : 'border-white/10'
                  } border-t-0 ${row.direction === 0 ? 'border-r-0' : 'border-l-0'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status Card */}
        <div className="mt-10 p-6 bg-white/3 border border-white/5 rounded-2xl animate-fade-up text-center" style={{ animationDelay: '0.4s' }}>
          {completedDays.length === totalDays ? (
            <>
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="text-xl font-black mb-1 text-yellow-400">Journey Complete!</h3>
              <p className="text-gray-500 text-sm mb-4">You crushed all {totalDays} days. Incredible work!</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-sm font-bold hover:opacity-90"
              >
                🔄 Start New Journey
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">{currentDay === 1 ? '🚀' : '🔥'}</div>
              <h3 className="text-lg font-black mb-1">
                {currentDay === 1 ? 'Ready to Start?' : `Day ${currentDay} is waiting!`}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {currentDay === 1
                  ? 'Click Day 1 on the road above to begin your journey'
                  : `You're on a ${currentStreak}-day streak. Don't break the chain!`}
              </p>
              <button
                onClick={() => handleDayClick(currentDay)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-sm font-bold hover:opacity-90"
              >
                🔥 Do Day {currentDay} Now
              </button>
            </>
          )}
        </div>



        {/* Stats — always visible */}
        <div className="mt-6 grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          {[
            { label: 'Days Done',      value: completedDays.length,             color: 'text-cyan-400',   icon: '📅' },
            { label: 'Current Streak', value: `${currentStreak}🔥`,             color: 'text-orange-400', icon: '🔥' },
            { label: 'Remaining',      value: Math.max(0, totalDays - completedDays.length), color: 'text-gray-300',   icon: '🎯' },
          ].map(s => (
            <div key={s.label} className="p-4 bg-white/3 border border-white/5 rounded-2xl text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reset + Controller actions */}
        <div className="flex items-center justify-center gap-6 mt-5 mb-2">
          {completedDays.length > 0 && completedDays.length < totalDays && (
            <button onClick={handleReset} className="text-xs text-gray-700 hover:text-red-400 transition-colors">
              🔄 Reset Journey
            </button>
          )}
          <button
            onClick={() => setShowController(true)}
            className="text-xs text-gray-700 hover:text-purple-400 transition-colors"
          >
            ⚙️ Change Journey Length
          </button>
        </div>
      </div>
    </div>
  );
}
