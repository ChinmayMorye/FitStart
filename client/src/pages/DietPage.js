import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIET_PLANS, DAY_NAMES, buildBothPlan } from '../data/dietPlans';
import { useSyncListener } from '../utils/journeySync';

const API_BASE = process.env.REACT_APP_API_URL || '';


// ─── Per-DAY storage helpers ──────────────────────────────────────────────────
function getDayStorageKey(dietType, week, day) {
  return `fitstart_diet_checks_${dietType}_w${week}_d${day}`;
}

// Returns checks object. If the journey day-done flag is set (written by
// StreakPage.handleMarkComplete OR restored from DB by App.restoreCompletedDayFlags),
// synthesise a fully-checked object from the diet plan so the UI shows ✓ on login.
function loadDayChecks(dietType, week, day, bothPlan = null) {
  // If this day is marked complete in the journey, return all items as checked
  if (localStorage.getItem(`fitstart_day_done_w${week}_d${day}`) === '1') {
    try {
      const planWeek = week % 4;
      // For 'both' dietType, use the provided bothPlan; for others use DIET_PLANS
      const plan = dietType === 'both'
        ? (bothPlan?.[planWeek]?.[day] || [])
        : (DIET_PLANS[dietType]?.[planWeek]?.[day] || []);
      const allChecked = {};
      plan.forEach((slot, mi) => {
        slot.items.filter(i => !i.hide).forEach((_, ii) => {
          allChecked[`m${mi}_i${ii}`] = true;
        });
      });
      // If plan has items, return the all-checked object (also persist it)
      if (Object.keys(allChecked).length > 0) {
        localStorage.setItem(getDayStorageKey(dietType, week, day), JSON.stringify(allChecked));
        return allChecked;
      }
    } catch (_) {}
  }
  try { return JSON.parse(localStorage.getItem(getDayStorageKey(dietType, week, day)) || '{}'); }
  catch { return {}; }
}

function saveDayChecks(dietType, week, day, checks, isAllChecked = false) {
  try { 
    localStorage.setItem(getDayStorageKey(dietType, week, day), JSON.stringify(checks));
    if (isAllChecked) {
      localStorage.setItem(`fitstart_day_done_w${week}_d${day}`, '1');
    } else {
      localStorage.removeItem(`fitstart_day_done_w${week}_d${day}`);
    }
  }
  catch {}
}

const itemKey = (mealIdx, itemIdx) => `m${mealIdx}_i${itemIdx}`;

// ─── Journey helpers ─────────────────────────────────────────────────────────
function getJourneyWeeks() {
  try {
    const saved = JSON.parse(localStorage.getItem('fitstart_streak') || 'null');
    if (saved?.totalDays) return Math.ceil(saved.totalDays / 7);
  } catch {}
  return 4;
}

const S = {
  macroColors: { Protein: '#06b6d4', Fat: '#f59e0b', Fiber: '#10b981', Carbs: '#a855f7' },
};

// ─── Macro Bar ────────────────────────────────────────────────────────────────
function MacroBar({ label, value, max }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = S.macroColors[label] || '#6b7280';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: '#6b7280', fontSize: '11px', width: '50px' }}>{label}</span>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, width: '32px', textAlign: 'right' }}>{value}g</span>
    </div>
  );
}

// ─── Custom Checkbox ──────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, size = 20, color = '#10b981' }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(!checked); }}
      aria-label={checked ? 'Uncheck' : 'Check'}
      style={{
        width: size, height: size, minWidth: size, borderRadius: '50%',
        border: `2px solid ${checked ? color : 'rgba(255,255,255,0.2)'}`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        boxShadow: checked ? `0 0 10px ${color}55` : 'none',
      }}
    >
      {checked && (
        <svg width={size * 0.48} height={size * 0.48} viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────
function MealCard({ mealGroup, mealIdx, isCheatDay, checks, onCheck }) {
  const [open, setOpen] = useState(mealIdx === 0);
  const [showAlts, setShowAlts] = useState({});
  const items = mealGroup.items.filter(i => !i.hide);

  const checkedCount = items.filter((_, ii) => checks[itemKey(mealIdx, ii)]).length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  const totals = items.reduce((a, it) => ({
    calories: a.calories + it.calories, protein: a.protein + it.protein,
    fat: a.fat + it.fat, fiber: a.fiber + it.fiber, carbs: a.carbs + it.carbs,
  }), { calories: 0, protein: 0, fat: 0, fiber: 0, carbs: 0 });

  const borderColor = isCheatDay ? 'rgba(236,72,153,0.3)'
    : allChecked ? 'rgba(16,185,129,0.5)'
    : open ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)';

  const hasAnyAlts = items.some(i => i.alternatives?.length > 0);

  return (
    <div style={{
      background: '#0d0d0d', border: `1px solid ${borderColor}`, borderRadius: '14px',
      overflow: 'hidden', transition: 'border-color 0.3s',
      boxShadow: allChecked && !isCheatDay ? '0 0 20px rgba(16,185,129,0.07)' : 'none',
    }}>
      {/* Header */}
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '26px' }}>{mealGroup.icon}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>{mealGroup.meal}</h3>
              {allChecked && !isCheatDay && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700 }}>✓ Done</span>
              )}
              {!allChecked && checkedCount > 0 && !isCheatDay && (
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 700 }}>{checkedCount}/{items.length}</span>
              )}
            </div>
            <p style={{ color: '#4b5563', fontSize: '11px', margin: 0 }}>{mealGroup.time}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, color: isCheatDay ? '#f472b6' : '#22d3ee', margin: 0, fontSize: '14px' }}>{totals.calories} kcal</p>
            {!isCheatDay && <p style={{ color: '#4b5563', fontSize: '11px', margin: 0 }}>{totals.protein}g protein</p>}
          </div>
          <span style={{ color: '#6b7280', fontSize: '12px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', display: 'inline-block' }}>▾</span>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Alternatives hint — always shown if any item has alts */}
          {hasAnyAlts && !isCheatDay && (
            <div style={{ marginTop: '12px', padding: '9px 12px', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>💡</span>
              <p style={{ color: '#ca8a04', fontSize: '11px', margin: 0 }}>
                If any ingredient isn't available, tap <strong style={{ color: '#fbbf24' }}>🔄 Alts</strong> next to the item to see same-macro substitutes!
              </p>
            </div>
          )}

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, ii) => {
              const key = itemKey(mealIdx, ii);
              const checked = !!checks[key];
              const hasAlts = item.alternatives?.length > 0;
              return (
                <div key={ii} style={{
                  padding: '13px 14px', borderRadius: '11px',
                  background: checked ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
                  transition: 'all 0.25s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {!isCheatDay && <Checkbox checked={checked} onChange={v => onCheck(key, v)} size={20} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <p style={{ color: checked ? '#6b7280' : '#fff', fontWeight: 600, fontSize: '13px', margin: 0, textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.25s' }}>{item.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hasAlts && (
                            <button onClick={() => setShowAlts(p => ({ ...p, [ii]: !p[ii] }))} style={{
                              fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
                              background: showAlts[ii] ? 'rgba(234,179,8,0.15)' : 'rgba(234,179,8,0.08)',
                              border: '1px solid rgba(234,179,8,0.25)',
                              color: '#ca8a04', cursor: 'pointer', fontWeight: 700,
                              transition: 'all 0.2s',
                            }}>
                              {showAlts[ii] ? '▲ Hide' : '🔄 Alts'}
                            </button>
                          )}
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 800, color: checked ? '#4b5563' : '#fff', fontSize: '15px', margin: 0 }}>{item.calories}</p>
                            <p style={{ color: '#4b5563', fontSize: '10px', margin: 0 }}>kcal</p>
                          </div>
                        </div>
                      </div>
                      {!isCheatDay && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <MacroBar label="Protein" value={item.protein} max={50} />
                          <MacroBar label="Fat" value={item.fat} max={40} />
                          <MacroBar label="Fiber" value={item.fiber} max={15} />
                          <MacroBar label="Carbs" value={item.carbs} max={70} />
                        </div>
                      )}
                      {/* Alternatives Panel */}
                      {showAlts[ii] && hasAlts && (
                        <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: '10px' }}>
                          <p style={{ color: '#ca8a04', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>🔄 If not available, you can also have:</p>
                          {item.alternatives.map((a, ai) => (
                            <div key={ai} style={{ padding: '8px 0', borderBottom: ai < item.alternatives.length - 1 ? '1px solid rgba(234,179,8,0.1)' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '13px' }}>{a.name}</span>
                                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>{a.calories} kcal</span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6b7280' }}>
                                <span>Protein: {a.protein}g</span>
                                <span>Fat: {a.fat}g</span>
                                <span>Fiber: {a.fiber}g</span>
                                <span>Carbs: {a.carbs}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meal total */}
          {!isCheatDay && (
            <div style={{ marginTop: '12px', padding: '12px 14px', background: 'linear-gradient(135deg,rgba(6,182,212,0.07),rgba(37,99,235,0.07))', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '10px' }}>
              <p style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Meal Total</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', textAlign: 'center' }}>
                {[{ l: 'Kcal', v: totals.calories, c: '#fff' }, { l: 'Protein', v: `${totals.protein}g`, c: '#22d3ee' }, { l: 'Fat', v: `${totals.fat}g`, c: '#fbbf24' }, { l: 'Fiber', v: `${totals.fiber}g`, c: '#34d399' }].map(m => (
                  <div key={m.l}><p style={{ fontWeight: 800, fontSize: '15px', color: m.c, margin: 0 }}>{m.v}</p><p style={{ color: '#4b5563', fontSize: '10px', margin: 0 }}>{m.l}</p></div>
                ))}
              </div>
            </div>
          )}
          {isCheatDay && (
            <div style={{ marginTop: '10px', padding: '12px', background: 'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(249,115,22,0.1))', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ color: '#f472b6', fontWeight: 700, fontSize: '14px', margin: 0 }}>🎉 Enjoy — you've earned it!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Missed Meals Modal ────────────────────────────────────────────────────────
function MissedMealsModal({ missedItems, missedTotals, onClose }) {
  const [action, setAction] = useState(null);

  const isAllDone = missedItems.length === 0;

  const handleConfirm = () => {
    if (action === 'add-later') {
      try {
        localStorage.setItem('fitstart_carry_missed', JSON.stringify({
          items: missedItems.map(x => ({ name: x.item.name, mealName: x.mealName, calories: x.item.calories })),
          savedAt: new Date().toISOString(),
        }));
      } catch {}
    }
    onClose(action);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '490px', width: '100%',
        background: 'linear-gradient(145deg, #0a0d1a 0%, #080b16 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        maxHeight: '92vh', overflowY: 'auto',
        animation: 'fadeInUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>

        {isAllDone ? (
          /* ── Perfect Day Celebration ── */
          <div style={{ padding: '44px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'statPop 0.5s ease both' }}>🏆</div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', marginBottom: '8px', letterSpacing: '-0.5px' }}>Perfect Day!</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              Zero meals missed today — you absolutely crushed it! 💪
            </p>
            <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', marginBottom: '24px' }}>
              <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, margin: 0 }}>✨ All nutrients fully consumed for the day!</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>Rest well tonight — tomorrow is a new beginning 🌱</p>
            </div>
            <button onClick={() => onClose('all-done')} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: '#fff', fontWeight: 800, fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(16,185,129,0.3)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🎉 Awesome! Keep Going
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>🍽️ Meals You Didn't Eat</h2>
                <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                  {missedItems.length} item{missedItems.length > 1 ? 's' : ''} unchecked today
                </p>
              </div>
              <button onClick={() => onClose(null)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '14px', flexShrink: 0, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >✕</button>
            </div>

            {/* ── Missed Items List ── */}
            <div style={{ padding: '4px 24px', maxHeight: '200px', overflowY: 'auto' }}>
              {missedItems.map(({ item, mealName }, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: idx < missedItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div>
                    <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>• {mealName}</p>
                    <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600, margin: '2px 0 0' }}>{item.name}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 700, margin: 0 }}>{item.calories} kcal</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Remaining Nutrient Totals ── */}
            <div style={{ margin: '12px 24px', padding: '16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px' }}>
              <p style={{ color: '#f87171', fontSize: '11px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⚠️ Total Remaining Nutrients
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                {[
                  { label: 'Protein', value: missedTotals.protein, color: '#06b6d4' },
                  { label: 'Fat', value: missedTotals.fat, color: '#f59e0b' },
                  { label: 'Fiber', value: missedTotals.fiber, color: '#10b981' },
                  { label: 'Carbs', value: missedTotals.carbs, color: '#a855f7' },
                ].map(m => (
                  <div key={m.label} style={{ background: `${m.color}18`, borderRadius: '10px', padding: '10px 6px', border: `1px solid ${m.color}25` }}>
                    <p style={{ color: m.color, fontWeight: 800, fontSize: '18px', margin: 0 }}>
                      {m.value}<span style={{ fontSize: '10px' }}>g</span>
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '10px', margin: 0 }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Options ── */}
            <div style={{ padding: '0 24px 16px' }}>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px', fontWeight: 600 }}>
                What would you like to do with these meals?
              </p>
              {[
                { value: 'add-later', label: 'Add it on another day', desc: "We'll note these — try to fit them in tomorrow!", emoji: '📅', color: '#22d3ee' },
                { value: 'ignore', label: 'Ignore it', desc: "No worries — it's okay to miss sometimes! 🙏", emoji: '✌️', color: '#10b981' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setAction(opt.value)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px', borderRadius: '12px', marginBottom: '10px',
                  border: `2px solid ${action === opt.value ? opt.color : 'rgba(255,255,255,0.08)'}`,
                  background: action === opt.value ? `${opt.color}12` : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  boxShadow: action === opt.value ? `0 0 20px ${opt.color}20` : 'none',
                }}>
                  {/* Radio button */}
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${action === opt.value ? opt.color : 'rgba(255,255,255,0.2)'}`,
                    background: action === opt.value ? opt.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {action === opt.value && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '22px' }}>{opt.emoji}</span>
                  <div>
                    <p style={{ color: action === opt.value ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: '14px', margin: 0 }}>{opt.label}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0 0' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Confirm Button ── */}
            <div style={{ padding: '0 24px 24px' }}>
              <button onClick={handleConfirm} disabled={!action} style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: action ? 'linear-gradient(135deg, #22d3ee, #818cf8)' : 'rgba(255,255,255,0.05)',
                color: action ? '#fff' : 'rgba(255,255,255,0.2)',
                fontWeight: 700, fontSize: '15px',
                cursor: action ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: action ? '0 8px 25px rgba(34,211,238,0.25)' : 'none',
              }}
                onMouseEnter={e => { if (action) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {action === 'add-later' ? '📅 Got it! Noted for Tomorrow' : action === 'ignore' ? '✌️ Ignore & Move On' : 'Please choose an option above'}
              </button>
              <p style={{ color: '#4b5563', fontSize: '11px', textAlign: 'center', marginTop: '10px', marginBottom: 0 }}>
                💡 Don't stress — tomorrow is a fresh start 🌱
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Day Complete + Summary Panel ────────────────────────────────────────────
function DayCompletePanel({ dietType, week, day, checks, plan, onCheckAll, isCheatDay, onShowSummary }) {
  const [cheatDone, setCheatDone] = useState(false);

  useEffect(() => {
    setCheatDone(localStorage.getItem(`fitstart_cheat_${dietType}_w${week}_d${day}`) === '1');
  }, [dietType, week, day]);

  if (isCheatDay) {
    return (
      <div style={{
        marginTop: '20px', padding: '24px', borderRadius: '16px', textAlign: 'center',
        background: cheatDone ? 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.1))' : 'linear-gradient(135deg,rgba(236,72,153,0.1),rgba(249,115,22,0.1))',
        border: `1px solid ${cheatDone ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.25)'}`,
        transition: 'all 0.4s',
      }}>
        <p style={{ fontSize: '30px', marginBottom: '8px' }}>🎉</p>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>Cheat Day!</p>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>No tracking — just enjoy yourself today!</p>
        <button onClick={() => {
          const next = !cheatDone; setCheatDone(next);
          localStorage.setItem(`fitstart_cheat_${dietType}_w${week}_d${day}`, next ? '1' : '0');
        }} style={{
          padding: '11px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
          border: 'none', cursor: 'pointer',
          background: cheatDone ? 'linear-gradient(135deg,#10b981,#22d3ee)' : 'linear-gradient(135deg,#ec4899,#f97316)',
          color: '#fff', boxShadow: cheatDone ? '0 0 20px rgba(16,185,129,0.3)' : '0 0 20px rgba(236,72,153,0.3)',
        }}>
          {cheatDone ? '✅ Enjoyed my Cheat Day!' : '🍔 Mark Cheat Day Done'}
        </button>
      </div>
    );
  }

  const allItems = plan.flatMap((slot, mi) =>
    slot.items.filter(i => !i.hide).map((item, ii) => ({
      key: itemKey(mi, ii), item, mealName: slot.meal, mealIdx: mi, itemIdx: ii,
    }))
  );
  const total = allItems.length;
  const done = allItems.filter(x => checks[x.key]).length;
  const missedItems = allItems.filter(x => !checks[x.key]);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isAllDone = done === total && total > 0;

  const statusColor = isAllDone ? '#10b981' : done > 0 ? '#f59e0b' : '#4b5563';
  const bg = isAllDone
    ? 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))'
    : done > 0 ? 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,179,8,0.05))' : 'rgba(255,255,255,0.02)';
  const bc = isAllDone ? 'rgba(16,185,129,0.3)' : done > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)';

  return (
    <div style={{ marginTop: '20px', padding: '20px 22px', background: bg, border: `1px solid ${bc}`, borderRadius: '16px', transition: 'all 0.4s', boxShadow: isAllDone ? '0 0 30px rgba(16,185,129,0.08)' : 'none' }}>
      {/* Title + progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', margin: 0 }}>
            {isAllDone ? '🎉 Day Complete!' : 'Day Progress'}
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{done} of {total} meals checked</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: statusColor, fontWeight: 800, fontSize: '22px' }}>{pct}%</span>
          <Checkbox checked={isAllDone} onChange={v => onCheckAll(v)} size={28} color={statusColor} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{
          height: '100%', borderRadius: '99px', transition: 'width 0.5s ease',
          width: `${pct}%`,
          background: isAllDone ? 'linear-gradient(90deg,#10b981,#22d3ee)' : done > 0 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : '#333',
          boxShadow: isAllDone ? '0 0 8px rgba(16,185,129,0.5)' : done > 0 ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
        }} />
      </div>

      {/* "All Meals Completed" button — triggers summary modal */}
      <button onClick={() => onShowSummary(missedItems)} style={{
        width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
        cursor: 'pointer', transition: 'all 0.25s',
        background: isAllDone
          ? 'linear-gradient(135deg, #10b981, #06b6d4)'
          : done > 0
            ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(234,179,8,0.12))'
            : 'rgba(255,255,255,0.04)',
        color: isAllDone ? '#fff' : done > 0 ? '#fbbf24' : '#6b7280',
        border: isAllDone ? 'none' : done > 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isAllDone ? '0 4px 20px rgba(16,185,129,0.3)' : 'none',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isAllDone
          ? '✅ All Meals Completed! View Summary →'
          : done > 0
            ? '📊 All Meals Completed — View Summary'
            : '📋 All Meals Completed — View Summary'}
      </button>

      {/* Celebration when all done */}
      {isAllDone && (
        <div style={{ marginTop: '14px', padding: '16px', background: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', marginBottom: '6px' }}>🏆</p>
          <p style={{ color: '#10b981', fontWeight: 800, fontSize: '14px', margin: 0 }}>
            Perfect Day! Zero meals missed. You crushed it!
          </p>
          <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '4px', marginBottom: 0 }}>
            Rest well tonight — tomorrow is a new beginning 💪
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Week Overview Strip ───────────────────────────────────────────────────────
function WeekOverview({ dietType, week, currentDay, onDay, resolvedPlan }) {
  const getDayStatus = (d) => {
    if (d === 6) {
      return localStorage.getItem(`fitstart_cheat_${dietType}_w${week}_d6`) === '1' ? 'complete' : 'none';
    }
    const plan = dietType === 'both'
      ? (resolvedPlan?.[week % 4]?.[d] || [])
      : (DIET_PLANS[dietType]?.[week % 4]?.[d] || []);
    const dayChecks = loadDayChecks(dietType, week, d, resolvedPlan);
    const allItems = plan.flatMap((slot, mi) =>
      slot.items.filter(i => !i.hide).map((_, ii) => itemKey(mi, ii))
    );
    if (allItems.length === 0) return 'none';
    const done = allItems.filter(k => dayChecks[k]).length;
    if (done === allItems.length) return 'complete';
    if (done > 0) return 'partial';
    return 'none';
  };

  const statuses = DAY_NAMES.map((_, d) => getDayStatus(d));
  const completedCount = statuses.filter(s => s === 'complete').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ color: '#4b5563', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Week {week + 1} Progress</p>
        <span style={{ fontSize: '11px', color: completedCount === 7 ? '#10b981' : '#4b5563', fontWeight: completedCount === 7 ? 700 : 400 }}>
          {completedCount}/7 days {completedCount === 7 ? '🎉' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
        {DAY_NAMES.map((name, d) => {
          const status = statuses[d];
          const isActive = d === currentDay;
          const isCheat = d === 6;
          const dotColor = status === 'complete' ? '#10b981' : status === 'partial' ? '#f59e0b' : 'rgba(255,255,255,0.1)';
          return (
            <button key={d} onClick={() => onDay(d)} title={`${name}${isCheat ? ' 🎉' : ''}`} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px 2px',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: status === 'complete' ? 'rgba(16,185,129,0.15)' : status === 'partial' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isActive ? (isCheat ? '#f472b6' : '#22d3ee') : dotColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                boxShadow: isActive ? `0 0 10px ${isCheat ? 'rgba(244,114,182,0.4)' : 'rgba(34,211,238,0.35)'}` : status === 'complete' ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                {status === 'complete' ? '✓' : status === 'partial' ? '·' : isCheat ? '🎉' : (
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dotColor }} />
                )}
              </div>
              <span style={{ fontSize: '9px', fontWeight: 600, color: isActive ? (isCheat ? '#f472b6' : '#22d3ee') : status === 'complete' ? '#10b981' : '#4b5563' }}>
                {name.slice(0, 3)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Tabs ─────────────────────────────────────────────────────────────────
function WeekTabs({ week, onWeek, dietType, totalWeeks, resolvedPlan }) {
  const getWeekStatus = (w) => {
    let total = 0; let done = 0;
    for (let d = 0; d < 7; d++) {
      if (d === 6) {
        if (localStorage.getItem(`fitstart_cheat_${dietType}_w${w}_d6`) === '1') done++;
        total++; continue;
      }
      const planWeek = w % 4;
      const plan = dietType === 'both'
        ? (resolvedPlan?.[planWeek]?.[d] || [])
        : (DIET_PLANS[dietType]?.[planWeek]?.[d] || []);
      const dayChecks = loadDayChecks(dietType, w, d, resolvedPlan);
      for (let mi = 0; mi < plan.length; mi++) {
        const slot = plan[mi];
        const items = slot.items || [];
        for (let ii = 0; ii < items.length; ii++) {
          if (items[ii].hide) continue;
          total += 1;
          if (dayChecks[itemKey(mi, ii)]) done += 1;
        }
      }
    }
    if (total === 0) return 'none';
    if (done === total) return 'complete';
    if (done > 0) return 'partial';
    return 'none';
  };

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i);
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
      {weeks.map(w => {
        const status = dietType ? getWeekStatus(w) : 'none';
        const isActive = week === w;
        return (
          <button key={w} onClick={() => onWeek(w)} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
            background: isActive ? 'linear-gradient(135deg,#06b6d4,#2563eb)' : status === 'complete' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
            color: isActive ? '#fff' : status === 'complete' ? '#10b981' : '#6b7280',
            boxShadow: isActive ? '0 4px 14px rgba(6,182,212,0.25)' : status === 'complete' ? '0 0 12px rgba(16,185,129,0.15)' : 'none',
            border: isActive ? 'none' : status === 'complete' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)',
          }}>
            Week {w + 1}
            {status === 'complete' && !isActive && <span style={{ color: '#10b981' }}>✓</span>}
            {status === 'partial' && !isActive && <span style={{ color: '#f59e0b' }}>·</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Day Tabs ─────────────────────────────────────────────────────────────────
function DayTabs({ day, onDay, dietType, week, resolvedPlan }) {
  const getDayStatus = (d) => {
    if (d === 6) return localStorage.getItem(`fitstart_cheat_${dietType}_w${week}_d6`) === '1' ? 'complete' : 'none';
    const planWeek = week % 4;
    const plan = dietType === 'both'
      ? (resolvedPlan?.[planWeek]?.[d] || [])
      : (DIET_PLANS[dietType]?.[planWeek]?.[d] || []);
    const dayChecks = loadDayChecks(dietType, week, d, resolvedPlan);
    const allItems = plan.flatMap((slot, mi) =>
      slot.items.filter(i => !i.hide).map((_, ii) => itemKey(mi, ii))
    );
    if (allItems.length === 0) return 'none';
    const done = allItems.filter(k => dayChecks[k]).length;
    if (done === allItems.length) return 'complete';
    if (done > 0) return 'partial';
    return 'none';
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {DAY_NAMES.map((name, d) => {
        const isCheat = d === 6;
        const isActive = day === d;
        const status = getDayStatus(d);
        return (
          <button key={d} onClick={() => onDay(d)} style={{
            padding: '7px 11px', borderRadius: '9px', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px',
            background: isActive && isCheat ? 'linear-gradient(135deg,#ec4899,#f97316)'
              : isActive ? 'linear-gradient(135deg,#10b981,#06b6d4)'
              : status === 'complete' ? 'rgba(16,185,129,0.12)'
              : isCheat ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.04)',
            color: isActive ? '#fff' : status === 'complete' ? '#10b981' : isCheat ? '#f472b6' : '#6b7280',
            boxShadow: isActive ? (isCheat ? '0 4px 14px rgba(236,72,153,0.25)' : '0 4px 14px rgba(16,185,129,0.25)') : status === 'complete' ? '0 0 8px rgba(16,185,129,0.2)' : 'none',
            border: isActive ? 'none' : status === 'complete' ? '1px solid rgba(16,185,129,0.25)' : isCheat ? '1px solid rgba(236,72,153,0.18)' : '1px solid rgba(255,255,255,0.05)',
          }}>
            {name.slice(0, 3)}{isCheat ? ' 🎉' : ''}
            {status === 'complete' && !isActive && <span style={{ fontSize: '10px' }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Diet Page ────────────────────────────────────────────────────────────────
// ─── Helper: get the resolved plan array for any diet type ───────────────────
function getResolvedPlan(dietType, bothVegDays, bothNonVegDays) {
  if (dietType === 'both') return buildBothPlan(bothVegDays, bothNonVegDays);
  return DIET_PLANS[dietType] || DIET_PLANS.veg;
}

export default function DietPage({ userInfo }) {
  const [selected, setSelected] = useState(null);
  const [savedPref, setSavedPref] = useState(null);
  const [saving, setSaving] = useState(false);
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [dayChecks, setDayChecks] = useState({});
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [showMissedModal, setShowMissedModal] = useState(false);
  const [modalMissedItems, setModalMissedItems] = useState([]);
  const [syncVersion, setSyncVersion] = useState(0);  // bumped when a journey day is completed

  // ── "Both" diet flow state ──────────────────────────────────────────────────
  const [bothStep, setBothStep] = useState(null);        // null | 'select-days'
  const [bothVegDays, setBothVegDays] = useState([]);    // day indices 0-5 for veg
  const [bothNonVegDays, setBothNonVegDays] = useState([]); // day indices 0-5 for non-veg
  const [bothDayError, setBothDayError] = useState('');

  const navigate = useNavigate();

  // Ref for auto-scrolling to the active (current journey) day card
  const activeDayScrollRef = useRef(null);

  // Re-render whenever a journey day is completed from StreakPage
  useSyncListener(useCallback(() => setSyncVersion(v => v + 1), []));

  // On mount: auto-navigate to the current journey day and scroll to it.
  // Works even when startDate is missing (estimates it from today).
  useEffect(() => {
    try {
      const streak    = JSON.parse(localStorage.getItem('fitstart_streak') || '{}');
      const userCache = JSON.parse(localStorage.getItem('fitstart_user')   || '{}');

      const completedDays  = streak.completedDays || [];
      const completedCount = completedDays.length;

      // Show the LAST completed day so the user sees what they just did.
      // Fall back to day 1 if nothing is completed yet.
      const targetJourneyDay = completedCount > 0 ? completedCount : 1;

      // Journey week tab (0-based)
      const journeyWeek = Math.floor((targetJourneyDay - 1) / 7);

      // Day-of-week tab: needs startDate to anchor the rolling week.
      // If startDate is not stored yet, estimate it from today − completedCount days.
      const rawStartDate =
        streak.startDate ||
        userCache?.journeyData?.startDate;

      const startDate = rawStartDate
        ? new Date(rawStartDate)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - completedCount);
            d.setHours(0, 0, 0, 0);
            return d;
          })();

      const target = new Date(startDate);
      target.setDate(startDate.getDate() + (targetJourneyDay - 1));
      const jsDay    = target.getDay();                    // 0 = Sun
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;     // convert → 0 = Mon

      setWeek(journeyWeek);
      setDay(dayOfWeek);
    } catch (_) {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to the active day section once data is loaded
  useEffect(() => {
    if (!activeDayScrollRef.current || !selected) return;
    const timer = setTimeout(() => {
      activeDayScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
    return () => clearTimeout(timer);
  }, [week, day, selected]);

  useEffect(() => { setTotalWeeks(getJourneyWeeks()); }, []);

  // Re-read totalWeeks whenever journey length changes (storage event fires
  // when JourneyContext writes a new fitstart_streak value)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'fitstart_streak') setTotalWeeks(getJourneyWeeks());
    };
    window.addEventListener('storage', handler);
    // Also listen for same-tab journey updates via custom event
    const sameTabHandler = () => setTotalWeeks(getJourneyWeeks());
    window.addEventListener('fitstart_journey_updated', sameTabHandler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('fitstart_journey_updated', sameTabHandler);
    };
  }, []);

  // Restore diet preference — if dietType exists in DB or localStorage, skip selection screen.
  // Runs whenever userInfo arrives (background /profile fetch) so it updates even if the
  // component mounted before the fetch completed.
  useEffect(() => {
    const pref = userInfo?.preferences?.dietType || localStorage.getItem('fitstart_diet_type');
    if (pref) {
      setSelected(pref);
      setSavedPref(pref);
      // Restore both-diet day configuration — prefer server values, fall back to localStorage
      if (pref === 'both') {
        try {
          const serverVeg    = userInfo?.preferences?.bothVegDays;
          const serverNonVeg = userInfo?.preferences?.bothNonVegDays;
          const vegDays    = (serverVeg    && serverVeg.length)    ? serverVeg    : JSON.parse(localStorage.getItem('fitstart_both_veg_days')    || '[]');
          const nonVegDays = (serverNonVeg && serverNonVeg.length) ? serverNonVeg : JSON.parse(localStorage.getItem('fitstart_both_nonveg_days') || '[]');
          setBothVegDays(vegDays);
          setBothNonVegDays(nonVegDays);
        } catch (_) {}
      }
    }
  }, [userInfo]);

  // Resolve the current plan array (handles both, veg, nonveg)
  const resolvedPlan = selected ? getResolvedPlan(selected, bothVegDays, bothNonVegDays) : null;

  useEffect(() => {
    if (selected) setDayChecks(loadDayChecks(selected, week, day, resolvedPlan));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, week, day, syncVersion, bothVegDays, bothNonVegDays]); // resolvedPlan derived from bothVegDays/bothNonVegDays

  const handleCheck = useCallback((key, val) => {
    setDayChecks(prev => {
      const next = { ...prev };
      if (val) next[key] = true; else delete next[key];
      // Count total items for this day to detect full completion
      const planWeek = week % 4;
      const plan = selected === 'both'
        ? (resolvedPlan?.[planWeek]?.[day] || [])
        : (DIET_PLANS[selected]?.[planWeek]?.[day] || []);
      const totalItems = plan.reduce((s, slot) => s + slot.items.filter(i => !i.hide).length, 0);
      const doneItems  = Object.keys(next).filter(k => next[k]).length;
      saveDayChecks(selected, week, day, next, totalItems > 0 && doneItems === totalItems);
      return next;
    });
  }, [selected, week, day, resolvedPlan]);

  const handleCheckAll = useCallback((val) => {
    const planWeek = week % 4;
    const plan = selected === 'both'
      ? (resolvedPlan?.[planWeek]?.[day] || [])
      : (DIET_PLANS[selected]?.[planWeek]?.[day] || []);
    const keys = plan.flatMap((slot, mi) =>
      slot.items.filter(i => !i.hide).map((_, ii) => itemKey(mi, ii))
    );
    setDayChecks(prev => {
      const next = { ...prev };
      keys.forEach(k => { if (val) next[k] = true; else delete next[k]; });
      // val=true means all checked, val=false means unchecked
      saveDayChecks(selected, week, day, next, val && keys.length > 0);
      return next;
    });
  }, [selected, week, day, resolvedPlan]);

  const handleWeekChange = (w) => { setWeek(w); setDay(0); };

  // Auto-save: called immediately when user clicks Veg/Non-veg (no manual button needed)
  const handleSavePreference = async (forceType) => {
    const typeToSave = forceType || selected;
    if (!typeToSave) return;
    setSaving(true);
    const token = localStorage.getItem('fitstart_token');
    // Optimistic local update first
    localStorage.setItem('fitstart_diet_type', typeToSave);
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (!u.preferences) u.preferences = {};
      u.preferences.dietType = typeToSave;
      u.preferences.saveDiet = true;
      if (typeToSave === 'both') {
        u.preferences.bothVegDays    = bothVegDays;
        u.preferences.bothNonVegDays = bothNonVegDays;
      }
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch (_) {}
    setSavedPref(typeToSave);
    try {
      if (token) {
        const body = { dietType: typeToSave, saveDiet: true };
        // Include both-diet day allocation so it survives logout → login
        if (typeToSave === 'both') {
          body.bothVegDays    = bothVegDays;
          body.bothNonVegDays = bothNonVegDays;
        }
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      }
    } catch (_) {
      // Local save already done above — server will sync on next profile refresh
    } finally { setSaving(false); }
  };

  // "Change my diet plan" — clears saved pref, shows selection screen again
  const handleChangePlan = async () => {
    localStorage.removeItem('fitstart_diet_type');
    localStorage.removeItem('fitstart_both_veg_days');
    localStorage.removeItem('fitstart_both_nonveg_days');
    setSavedPref(null);
    setSelected(null);
    setBothStep(null);
    setBothVegDays([]);
    setBothNonVegDays([]);
    setBothDayError('');
    const token = localStorage.getItem('fitstart_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dietType: null, saveDiet: false }),
        });
        const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
        if (u.preferences) { u.preferences.dietType = null; u.preferences.saveDiet = false; }
        localStorage.setItem('fitstart_user', JSON.stringify(u));
      } catch (_) {}
    }
  };

  const handleShowSummary = (missedItems) => {
    setModalMissedItems(missedItems);
    setShowMissedModal(true);
  };

  const handleModalClose = () => {
    setShowMissedModal(false);
    setModalMissedItems([]);
  };

  // Back button: if plan is saved go to dashboard directly (don't show selection screen)
  const handleBack = () => {
    if (selected && savedPref) {
      navigate('/dashboard');
    } else if (bothStep === 'select-days') {
      // Go back to diet type selection from the day-picker
      setBothStep(null);
      setBothDayError('');
    } else if (selected) {
      setSelected(null);
    } else {
      navigate('/dashboard');
    }
  };

  const isCheatDay = day === 6;
  const planWeek = week % 4;
  const currentPlan = selected && resolvedPlan ? (resolvedPlan[planWeek]?.[day] || []) : [];

  // Detect what kind of day this is in a 'both' plan (for display label)
  const isBothNonVegDay = selected === 'both' && day !== 6 && bothNonVegDays.includes(day);

  const grandTotal = (pd) => pd.reduce((acc, slot) =>
    slot.items.filter(i => !i.hide).reduce((a, it) => ({
      calories: a.calories + it.calories, protein: a.protein + it.protein,
      fat: a.fat + it.fat, fiber: a.fiber + it.fiber,
    }), acc), { calories: 0, protein: 0, fat: 0, fiber: 0 }
  );
  const totals = selected && !isCheatDay ? grandTotal(currentPlan) : null;

  // ── Both-diet day selector helpers ─────────────────────────────────────────
  const STRUCTURED_DAYS = DAY_NAMES.slice(0, 6); // Mon–Sat

  const toggleBothDay = (dayIdx, type) => {
    setBothDayError('');
    if (type === 'nonveg') {
      setBothNonVegDays(prev => {
        const next = prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx];
        // Auto-remove from veg if it was there
        setBothVegDays(vd => vd.filter(d => d !== dayIdx || !next.includes(dayIdx)));
        return next;
      });
    } else {
      setBothVegDays(prev => {
        const next = prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx];
        // Auto-remove from nonveg if it was there
        setBothNonVegDays(nvd => nvd.filter(d => d !== dayIdx || !next.includes(dayIdx)));
        return next;
      });
    }
  };

  const handleGenerateBothPlan = () => {
    // Validate: all 6 structured days must be covered exactly once
    const allCovered = STRUCTURED_DAYS.every((_, d) => bothVegDays.includes(d) || bothNonVegDays.includes(d));
    const noOverlap  = !STRUCTURED_DAYS.some((_, d) => bothVegDays.includes(d) && bothNonVegDays.includes(d));
    if (!allCovered) { setBothDayError('⚠️ All 6 days (Mon–Sat) must be assigned to either Vegetarian or Non-Vegetarian.'); return; }
    if (!noOverlap)  { setBothDayError('⚠️ A day cannot be in both lists. Please fix the overlap.'); return; }
    if (bothVegDays.length === 0) { setBothDayError('⚠️ Please assign at least one day as Vegetarian.'); return; }
    if (bothNonVegDays.length === 0) { setBothDayError('⚠️ Please assign at least one day as Non-Vegetarian.'); return; }
    // Persist the day configuration
    localStorage.setItem('fitstart_both_veg_days',    JSON.stringify(bothVegDays));
    localStorage.setItem('fitstart_both_nonveg_days', JSON.stringify(bothNonVegDays));
    // Select and save the plan
    setBothStep(null);
    setSelected('both');
    handleSavePreference('both');
  };

  // Calculate missed totals dynamically for modal
  const missedTotalsCalc = modalMissedItems.reduce((a, { item }) => ({
    protein: a.protein + (item.protein || 0),
    fat: a.fat + (item.fat || 0),
    fiber: a.fiber + (item.fiber || 0),
    carbs: a.carbs + (item.carbs || 0),
  }), { protein: 0, fat: 0, fiber: 0, carbs: 0 });

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '500px', height: '500px', background: 'rgba(16,185,129,0.04)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '500px', height: '500px', background: 'rgba(6,182,212,0.04)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

      {/* Missed Meals Modal */}
      {showMissedModal && (
        <MissedMealsModal
          missedItems={modalMissedItems}
          missedTotals={missedTotalsCalc}
          onClose={handleModalClose}
        />
      )}

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 28px', flexWrap: 'wrap', background: 'rgba(5,5,15,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(0,240,255,0.08)', boxShadow: '0 1px 30px rgba(0,0,0,0.4)', position: 'sticky', top: 0, zIndex: 30 }}>
        <button onClick={handleBack}
          className="btn-ghost"
          style={{ borderRadius: '100px', padding: '8px 18px', fontSize: '13px' }}
        >
          ← Back
        </button>
        <span style={{ color: '#00F0FF', fontWeight: 900, fontSize: '20px', fontStyle: 'italic', letterSpacing: '-0.05em', textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>FITSTART</span>
        <span style={{ color: '#374151' }}>/ Diet Plan</span>
        {selected && <><span style={{ color: '#374151' }}>/</span><span style={{ color: '#9ca3af' }}>{selected === 'veg' ? '🥦 Vegetarian' : selected === 'nonveg' ? '🍗 Non-Vegetarian' : '🥗🍗 Mixed Diet'}</span></>}
        {selected && totalWeeks > 4 && (
          <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', color: '#00F0FF', fontWeight: 700 }}>
            {totalWeeks * 7}-Day Journey · {totalWeeks} Weeks
          </span>
        )}
        {/* Change Plan button in navbar (when plan is active & saved) */}
        {selected && savedPref && (
          <button
            onClick={handleChangePlan}
            className="btn-glass"
            style={{ marginLeft: selected && totalWeeks <= 4 ? 'auto' : '8px', fontSize: '12px', padding: '5px 12px', borderRadius: '8px' }}
          >
            ✏️ Change Plan
          </button>
        )}
      </nav>

      <div style={{ maxWidth: selected ? '720px' : '1100px', margin: '0 auto', padding: '36px 22px', transition: 'max-width 0.3s ease' }}>

        {/* ── Day Selection Step (shown when 'Both' is clicked) ── */}
        {!selected && bothStep === 'select-days' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '44px', marginBottom: '14px' }}>🥗🍗</div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
                Choose Your{' '}
                <span style={{ background: 'linear-gradient(135deg,#34d399,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Weekly Split</span>
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
                Assign each day (Mon–Sat) to either Vegetarian or Non-Vegetarian. Day 7 stays Cheat Day 🎉
              </p>
            </div>

            {/* Non-veg days selector */}
            <div style={{ marginBottom: '24px', padding: '22px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '22px' }}>🍗</span>
                <div>
                  <p style={{ color: '#fb923c', fontWeight: 800, fontSize: '14px', margin: 0 }}>Non-Vegetarian Days</p>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Which days will you eat non-veg? (chicken, fish, eggs)</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STRUCTURED_DAYS.map((name, di) => {
                  const isNV = bothNonVegDays.includes(di);
                  const isV  = bothVegDays.includes(di);
                  return (
                    <button key={di} onClick={() => toggleBothDay(di, 'nonveg')} style={{
                      padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: isNV ? 'rgba(249,115,22,0.2)' : isV ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                      color: isNV ? '#fb923c' : isV ? '#34d399' : '#6b7280',
                      border: isNV ? '2px solid rgba(249,115,22,0.5)' : isV ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isNV ? '0 0 12px rgba(249,115,22,0.2)' : 'none',
                    }}>
                      {isNV ? '🍗 ' : isV ? '🥦 ' : ''}{name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px', marginBottom: 0 }}>
                {bothNonVegDays.length === 0 ? 'No non-veg days selected yet' : `${bothNonVegDays.length} day${bothNonVegDays.length > 1 ? 's' : ''} selected: ${bothNonVegDays.map(d => DAY_NAMES[d].slice(0,3)).join(', ')}`}
              </p>
            </div>

            {/* Veg days selector */}
            <div style={{ marginBottom: '24px', padding: '22px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '22px' }}>🥦</span>
                <div>
                  <p style={{ color: '#34d399', fontWeight: 800, fontSize: '14px', margin: 0 }}>Vegetarian Days</p>
                  <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Which days will you eat veg? (paneer, dal, tofu)</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STRUCTURED_DAYS.map((name, di) => {
                  const isV  = bothVegDays.includes(di);
                  const isNV = bothNonVegDays.includes(di);
                  return (
                    <button key={di} onClick={() => toggleBothDay(di, 'veg')} style={{
                      padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: isV ? 'rgba(16,185,129,0.2)' : isNV ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.04)',
                      color: isV ? '#34d399' : isNV ? '#fb923c' : '#6b7280',
                      border: isV ? '2px solid rgba(16,185,129,0.5)' : isNV ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isV ? '0 0 12px rgba(16,185,129,0.2)' : 'none',
                    }}>
                      {isV ? '🥦 ' : isNV ? '🍗 ' : ''}{name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px', marginBottom: 0 }}>
                {bothVegDays.length === 0 ? 'No veg days selected yet' : `${bothVegDays.length} day${bothVegDays.length > 1 ? 's' : ''} selected: ${bothVegDays.map(d => DAY_NAMES[d].slice(0,3)).join(', ')}`}
              </p>
            </div>

            {/* Coverage summary */}
            <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '16px' }}>📋</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0, fontWeight: 600 }}>
                  Coverage: {bothVegDays.length + bothNonVegDays.length}/6 days assigned
                  {bothVegDays.length + bothNonVegDays.length === 6 ? ' ✅' : ''}
                </p>
                <p style={{ color: '#4b5563', fontSize: '11px', margin: '2px 0 0' }}>Day 7 (Sunday) is always Cheat Day 🎉 — no assignment needed</p>
              </div>
            </div>

            {/* Validation error */}
            {bothDayError && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px' }}>
                <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, margin: 0 }}>{bothDayError}</p>
              </div>
            )}

            {/* Generate button */}
            <button onClick={handleGenerateBothPlan} style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #34d399, #22d3ee, #fb923c)',
              color: '#000', fontWeight: 900, fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(34,211,238,0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginBottom: '12px',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(34,211,238,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,211,238,0.25)'; }}
            >
              🚀 Generate My Mixed Plan
            </button>
            <button onClick={() => { setBothStep(null); setBothDayError(''); }} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
              color: '#6b7280', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              ← Back to diet type selection
            </button>
          </div>
        )}

        {/* ── Selection Screen (only shown when no savedPref / plan not saved) ── */}
        {!selected && !bothStep && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '52px' }}>
              <div style={{ fontSize: '44px', marginBottom: '14px' }}>🥗</div>
              <h1 style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
                Choose Your{' '}
                <span style={{ background: 'linear-gradient(135deg,#34d399,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Diet Type</span>
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {totalWeeks}-week plan · check off meals daily · new day = fresh start · see what you missed · track progress week by week.
              </p>
            </div>
            <div className="diet-cards-row">
              {[
                { key: 'veg', icon: '🥦', title: 'Vegetarian', desc: 'Plant-based meals with dairy & eggs.', tags: ['Paneer', 'Lentils', 'Tofu', 'Grains'], border: 'rgba(16,185,129,0.2)', hbg: 'rgba(16,185,129,0.12)', hborder: 'rgba(16,185,129,0.5)', tc: '#34d399', bg: 'rgba(16,185,129,0.08)', tb: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.25)', isBoth: false },
                { key: 'both', icon: '🥗🍗', title: 'Both', desc: 'Mix veg & non-veg across your week.', tags: ['Paneer', 'Chicken', 'Eggs', 'Dal'], border: 'rgba(139,92,246,0.2)', hbg: 'rgba(139,92,246,0.12)', hborder: 'rgba(139,92,246,0.5)', tc: '#a78bfa', bg: 'rgba(139,92,246,0.08)', tb: 'rgba(139,92,246,0.2)', glow: 'rgba(139,92,246,0.25)', isBoth: true },
                { key: 'nonveg', icon: '🍗', title: 'Non-Vegetarian', desc: 'High-protein chicken, fish & eggs.', tags: ['Chicken', 'Salmon', 'Eggs', 'Meat'], border: 'rgba(249,115,22,0.2)', hbg: 'rgba(249,115,22,0.12)', hborder: 'rgba(249,115,22,0.5)', tc: '#fb923c', bg: 'rgba(249,115,22,0.08)', tb: 'rgba(249,115,22,0.2)', glow: 'rgba(249,115,22,0.25)', isBoth: false },
              ].map(o => (
                <button key={o.key} className="diet-card" onClick={() => {
                    if (o.isBoth) {
                      // Show day-selection step for 'Both'
                      setBothStep('select-days');
                      setBothVegDays([]);
                      setBothNonVegDays([]);
                      setBothDayError('');
                    } else {
                      // Select & immediately auto-save to DB — no manual button needed
                      setSelected(o.key);
                      handleSavePreference(o.key);
                    }
                  }} style={{
                  width: '100%', padding: '28px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: `1px solid ${o.border}`, borderRadius: '22px',
                  cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s, background 0.3s',
                  boxShadow: 'none', height: '100%',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = o.hborder; e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 40px ${o.glow}`; e.currentTarget.style.background = o.hbg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = o.border; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                  <div style={{ fontSize: '48px', marginBottom: '14px' }}>{o.icon}</div>
                  <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>{o.title}</h2>
                  <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>{o.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {o.tags.map(t => <span key={t} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '99px', background: o.bg, border: `1px solid ${o.tb}`, color: o.tc }}>{t}</span>)}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '24px', padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <span style={{ fontSize: '22px' }}>📅</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{totalWeeks}-Week Rotation Plan</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>6 structured days per week · Day 7 = Cheat Day 🎉 · Each day starts fresh — tick as you eat · See exactly what you missed · Progress tracked across all weeks</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Meal Plan Screen ── */}
        {selected && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{selected === 'veg' ? '🥦' : selected === 'nonveg' ? '🍗' : '🥗🍗'}</span>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.04em', margin: 0 }}>
                    {selected === 'veg' ? 'Vegetarian' : selected === 'nonveg' ? 'Non-Vegetarian' : 'Mixed Diet'} Plan
                    {selected === 'both' && !isCheatDay && (
                      <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
                        background: isBothNonVegDay ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.12)',
                        border: isBothNonVegDay ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(16,185,129,0.3)',
                        color: isBothNonVegDay ? '#fb923c' : '#34d399',
                      }}>
                        {isBothNonVegDay ? '🍗 Non-Veg Day' : '🥦 Veg Day'}
                      </span>
                    )}
                  </h1>
                </div>
                {/* Change my diet plan sub-option */}
                <button
                  onClick={handleChangePlan}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', padding: '7px 14px', borderRadius: '10px',
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                    color: '#a78bfa', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.color = '#c4b5fd'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.color = '#a78bfa'; }}
                >
                  ✏️ Change my diet plan
                </button>
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 0 38px' }}>
                {isCheatDay ? '🎉 Cheat Day — enjoy guilt-free!' : `Week ${week + 1} · ${DAY_NAMES[day]} · Check off each meal as you eat it · New day = fresh start 🌱`}
              </p>
            </div>

            {/* Week tabs */}
            <WeekTabs week={week} onWeek={handleWeekChange} dietType={selected} totalWeeks={totalWeeks} resolvedPlan={resolvedPlan} />
            {/* Day tabs */}
            <DayTabs day={day} onDay={setDay} dietType={selected} week={week} resolvedPlan={resolvedPlan} />

            {/* Week progress dots */}
            <div style={{ margin: '14px 0', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <WeekOverview dietType={selected} week={week} currentDay={day} onDay={setDay} resolvedPlan={resolvedPlan} />
            </div>

            {/* Cheat day banner */}
            {isCheatDay && (
              <div style={{ marginBottom: '18px', padding: '18px', background: 'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(249,115,22,0.15))', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '26px', marginBottom: '4px' }}>🎉🍔🍕🍰</p>
                <p style={{ color: '#f472b6', fontWeight: 900, fontSize: '20px', margin: '0 0 4px' }}>CHEAT DAY!</p>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>You crushed 6 days of clean eating. No rules today!</p>
              </div>
            )}

            {/* Daily summary */}
            {totals && (
              <div style={{ marginBottom: '16px', padding: '18px', background: 'linear-gradient(135deg,rgba(13,31,26,0.8),rgba(10,16,32,0.8))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' }}>
                <p style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Daily Target — Week {week + 1}, {DAY_NAMES[day]}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', textAlign: 'center' }}>
                  {[
                    { l: 'Calories', v: totals.calories, u: ' kcal', c: '#fff', b: 'rgba(255,255,255,0.05)' },
                    { l: 'Protein', v: `${totals.protein}g`, c: '#22d3ee', b: 'rgba(6,182,212,0.05)' },
                    { l: 'Fat', v: `${totals.fat}g`, c: '#fbbf24', b: 'rgba(245,158,11,0.05)' },
                    { l: 'Fiber', v: `${totals.fiber}g`, c: '#34d399', b: 'rgba(16,185,129,0.05)' },
                  ].map(s => (
                    <div key={s.l} style={{ padding: '9px', borderRadius: '10px', background: s.b }}>
                      <p style={{ fontWeight: 800, fontSize: '18px', color: s.c, margin: 0 }}>{s.v}<span style={{ fontSize: '10px' }}>{s.u || ''}</span></p>
                      <p style={{ color: '#4b5563', fontSize: '10px', margin: 0 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal cards — ref enables auto-scroll to the current day */}
            <div
              ref={activeDayScrollRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: '16px',
                padding: '4px',
                outline: '2px solid rgba(34,211,238,0.22)',
                outlineOffset: '4px',
                boxShadow: '0 0 24px rgba(34,211,238,0.07)',
                transition: 'outline-color 0.4s',
              }}
            >
              {currentPlan.map((mg, i) => (
                <MealCard
                  key={`w${week}-d${day}-m${i}`}
                  mealGroup={mg}
                  mealIdx={i}
                  isCheatDay={isCheatDay}
                  checks={dayChecks}
                  onCheck={handleCheck}
                />
              ))}
            </div>

            {/* Day Complete Panel — "All Meals Completed" triggers modal */}
            <DayCompletePanel
              dietType={selected} week={week} day={day}
              checks={dayChecks} plan={currentPlan}
              onCheckAll={handleCheckAll} isCheatDay={isCheatDay}
              onShowSummary={handleShowSummary}
            />

            {/* Alternatives legend */}
            {!isCheatDay && (
              <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(234,179,8,0.03)', border: '1px solid rgba(234,179,8,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>🔄</span>
                <div>
                  <p style={{ color: '#ca8a04', fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>Meal Alternatives Available</p>
                  <p style={{ color: '#4b5563', fontSize: '12px', margin: 0 }}>Tap <strong style={{ color: '#fbbf24' }}>🔄 Alts</strong> on any meal item to see same-macro alternatives. If you can't find an ingredient, substitute with ease!</p>
                </div>
              </div>
            )}

            {/* ── Auto-saved status badge ── */}
            <div style={{
              marginTop: '18px', padding: '14px 18px',
              background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.06))',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>{saving ? '⏳' : '✅'}</span>
              <div>
                <p style={{ color: '#10b981', fontWeight: 700, fontSize: '12px', margin: 0 }}>
                  {saving ? 'Saving plan…' : `Plan saved — ${selected === 'veg' ? 'Vegetarian' : selected === 'nonveg' ? 'Non-Vegetarian' : 'Mixed (Veg + Non-Veg)'} will load automatically next login`}
                </p>
                <p style={{ color: '#4b5563', fontSize: '11px', margin: '2px 0 0' }}>
                  To switch plans, use the ✏️ Change my diet plan button above
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#4b5563', fontSize: '12px', margin: 0 }}>
                💧 Drink at least <span style={{ color: '#22d3ee' }}>2.5–3L water</span> daily · Each day starts fresh — a new beginning 🌱 · Consult a nutritionist for specific goals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
