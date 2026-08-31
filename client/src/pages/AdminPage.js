import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const ADMIN_ID    = 'chinmay2115';
const ADMIN_PWD   = 'India@11';
const API_SECRET  = 'fitstart_admin_2024';
const SESSION_KEY = 'fitstart_admin_v3';
const API_BASE    = process.env.REACT_APP_API_URL || '';

/* ─────────────────────────── HELPERS ───────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
const timeAgo = (d) => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const avatarGrad = (n = '') => {
  let h = 0;
  for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
  const g = [
    ['#8b5cf6','#ec4899'],['#06b6d4','#3b82f6'],['#10b981','#06b6d4'],
    ['#f59e0b','#ef4444'],['#6366f1','#8b5cf6'],['#ec4899','#f59e0b'],
  ];
  return g[Math.abs(h) % g.length];
};

/* ════════════════════════════════════════════════════════════════
   GLOBAL STYLES  (injected once)
═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050818; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,.35); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,.6); }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-12px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-7px)} 80%{transform:translateX(7px)} }
  @keyframes shimmer  { from{background-position:200% 0} to{background-position:-200% 0} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,.3)} 50%{box-shadow:0 0 50px rgba(139,92,246,.7)} }
  @keyframes countUp  { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  @keyframes borderFlow {
    0%   { border-color: rgba(139,92,246,.5); }
    33%  { border-color: rgba(236,72,153,.5); }
    66%  { border-color: rgba(34,211,238,.5); }
    100% { border-color: rgba(139,92,246,.5); }
  }

  .admin-root { font-family: 'Inter', sans-serif; color: #e2e8f0; min-height: 100vh; background: #050818; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; letter-spacing:.03em; }
  .badge-green  { background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.3); color:#34d399; }
  .badge-amber  { background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.3); color:#fbbf24; }
  .badge-cyan   { background:rgba(34,211,238,.12); border:1px solid rgba(34,211,238,.3); color:#22d3ee; }
  .badge-purple { background:rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.3); color:#a78bfa; }
  .badge-red    { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.3); color:#f87171; }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px #0d1225 inset !important;
    -webkit-text-fill-color: #fff !important;
  }
`;

function StyleInjector() {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    const el = document.createElement('style');
    el.innerHTML = GLOBAL_CSS;
    document.head.appendChild(el);
    injected.current = true;
  }, []);
  return null;
}

/* ════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════════ */
function AnimCounter({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / 30);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}</>;
}

/* ════════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════ */
function StatCard({ icon, label, value, sub, color1, color2, onClick, delay = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,.028)',
        border: `1px solid ${hov ? color1 + '55' : 'rgba(255,255,255,.07)'}`,
        borderRadius: '24px',
        padding: '28px 24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
        boxShadow: hov ? `0 24px 60px ${color1}22, 0 0 0 1px ${color1}33` : '0 4px 24px rgba(0,0,0,.4)',
        animation: `fadeUp .5s ease both`,
        animationDelay: `${delay}ms`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Radial glow bg */}
      <div style={{
        position: 'absolute', top: '-40%', right: '-20%',
        width: '180px', height: '180px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color1}18, transparent 70%)`,
        pointerEvents: 'none', transition: 'opacity .3s',
        opacity: hov ? 1 : 0.5,
      }}/>
      <div style={{
        position: 'absolute', bottom: '-30%', left: '-10%',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color2}10, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      {hov && onClick && (
        <div style={{ position: 'absolute', top: 12, right: 14, fontSize: '10px', fontWeight: 800, color: color1, letterSpacing: '.08em', opacity: .8 }}>
          VIEW →
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: `linear-gradient(135deg, ${color1}22, ${color2}18)`,
          border: `1px solid ${color1}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', marginBottom: '20px',
          boxShadow: `0 8px 24px ${color1}18`,
        }}>{icon}</div>

        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          {label}
        </p>
        <p style={{
          fontSize: '44px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: '8px',
          background: `linear-gradient(135deg, ${color1}, ${color2})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'countUp .4s ease both',
        }}>
          <AnimCounter target={value ?? 0} />
        </p>
        {sub && <p style={{ color: color1, fontSize: '12px', fontWeight: 600, opacity: .75 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   USER ROW DETAIL (expandable)
═══════════════════════════════════════════════════════════════ */
function UserRow({ user, idx, isExpanded, onToggle }) {
  const jd     = user.journeyData   || {};
  const pref   = user.preferences   || {};
  const done   = (jd.completedDays  || []).length;
  const pct    = jd.totalDays ? Math.round((done / jd.totalDays) * 100) : 0;
  const [g1, g2] = avatarGrad(user.username || '?');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        onClick={onToggle}
        style={{
          borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,.05)',
          cursor: 'pointer',
          transition: 'background .15s',
          background: isExpanded ? 'rgba(139,92,246,.06)' : 'transparent',
        }}
        onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'rgba(255,255,255,.022)')}
        onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
      >
        <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,.2)', fontSize: '12px', fontWeight: 600 }}>{idx + 1}</td>

        {/* Avatar + name */}
        <td style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${g1}, ${g2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 900, color: '#fff', flexShrink: 0,
              boxShadow: `0 4px 14px ${g1}40`,
            }}>
              {(user.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{user.username}</p>
              <p className="mono" style={{ color: 'rgba(255,255,255,.2)', fontSize: '9px' }}>
                {String(user._id)}
              </p>
            </div>
          </div>
        </td>

        {/* Joined */}
        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
          <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 500 }}>{fmtDate(user.createdAt)}</p>
          <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '10px', marginTop: '2px' }}>{timeAgo(user.createdAt)}</p>
        </td>

        {/* Journey */}
        <td style={{ padding: '14px 16px' }}>
          {jd.totalDays ? (
            <div>
              <span className="badge badge-purple">{jd.totalDays}d · {pct}%</span>
              <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,#8b5cf6,#ec4899)`, borderRadius: '99px' }}/>
              </div>
            </div>
          ) : <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '12px' }}>—</span>}
        </td>

        {/* Streak */}
        <td style={{ padding: '14px 16px' }}>
          {jd.currentStreak > 0
            ? <span className="badge badge-amber">🔥 {jd.currentStreak}d</span>
            : <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '12px' }}>—</span>}
        </td>

        {/* Diet */}
        <td style={{ padding: '14px 16px' }}>
          {pref.dietType === 'veg'    ? <span className="badge badge-green">🥦 Veg</span>
           : pref.dietType === 'nonveg' ? <span className="badge badge-amber">🍗 Non-Veg</span>
           : <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '12px' }}>—</span>}
        </td>

        {/* Workout */}
        <td style={{ padding: '14px 16px' }}>
          {pref.workoutDays
            ? <span className="badge badge-cyan">Plan {pref.workoutPlanId || '?'} · {pref.workoutDays}d/wk</span>
            : <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '12px' }}>—</span>}
        </td>

        {/* Expand toggle */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: isExpanded ? 'rgba(139,92,246,.25)' : 'rgba(255,255,255,.05)',
            border: `1px solid ${isExpanded ? 'rgba(139,92,246,.5)' : 'rgba(255,255,255,.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: isExpanded ? '#a78bfa' : 'rgba(255,255,255,.3)',
            transition: 'all .2s', margin: '0 auto',
          }}>
            {isExpanded ? '▲' : '▼'}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {isExpanded && (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <td colSpan={8} style={{ padding: '0 16px 20px', background: 'rgba(139,92,246,.04)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px', paddingTop: '16px', animation: 'fadeUp .25s ease both',
            }}>

              {/* Account block */}
              <DetailBlock icon="🪪" title="Account Info" color="#8b5cf6">
                <DetailRow label="MongoDB ID">
                  <span className="mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)', wordBreak: 'break-all' }}>
                    {String(user._id)}
                  </span>
                </DetailRow>
                <DetailRow label="Created">
                  <span>{fmtDateTime(user.createdAt)}</span>
                </DetailRow>
                <DetailRow label="Last active">
                  <span>{fmtDateTime(jd.lastActiveDate)} <em style={{ color: 'rgba(255,255,255,.3)', fontSize: '10px' }}>({timeAgo(jd.lastActiveDate)})</em></span>
                </DetailRow>
                {/* Password hash */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '10px', marginTop: '4px' }}>
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '10px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    🔑 Password Hash
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="mono" style={{
                      color: 'rgba(255,255,255,.35)', fontSize: '10px',
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: showPwd ? 'normal' : 'nowrap',
                      wordBreak: 'break-all',
                    }}>
                      {showPwd ? (user.password || 'N/A') : '••••••••••••••••••••••••••••••••••••••'}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); setShowPwd(p => !p); }}
                      style={{
                        padding: '4px 10px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
                        color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                      }}
                    >
                      {showPwd ? '🙈 Hide' : '👁 Show'}
                    </button>
                  </div>
                </div>
              </DetailBlock>

              {/* Body stats block */}
              <DetailBlock icon="📊" title="Body Stats" color="#22d3ee">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                  {[
                    { label: 'Age',    val: user.age    ? `${user.age} yrs`              : '—', icon: '🎂' },
                    { label: 'Weight', val: user.weight ? `${user.weight} kg`            : '—', icon: '⚖️' },
                    { label: 'Height', val: user.height ? `${user.height} cm`            : '—', icon: '📏' },
                    { label: 'BMI',    val: user.weight && user.height ?
                      `${(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)}` : '—', icon: '💪' },
                  ].map(({ label, val, icon }) => (
                    <div key={label} style={{
                      padding: '12px', borderRadius: '12px',
                      background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '18px', marginBottom: '5px' }}>{icon}</div>
                      <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '2px' }}>{val}</div>
                      <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '10px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </DetailBlock>

              {/* Journey block */}
              <DetailBlock icon="🚀" title="Journey" color="#10b981">
                <DetailRow label="Plan Length"><span>{jd.totalDays ? `${jd.totalDays} Days` : 'Not started'}</span></DetailRow>
                <DetailRow label="Completed"><span>{jd.totalDays ? `${done} / ${jd.totalDays} days` : '—'}</span></DetailRow>
                <DetailRow label="Start Date"><span>{fmtDate(jd.startDate)}</span></DetailRow>
                <DetailRow label="Streak"><span>{jd.currentStreak > 0 ? `🔥 ${jd.currentStreak} days` : 'No streak'}</span></DetailRow>
                <DetailRow label="Workout Place"><span>{(jd.workoutPlace || []).join(', ') || '—'}</span></DetailRow>
                {jd.totalDays > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px' }}>Progress</span>
                      <span style={{ color: pct === 100 ? '#10b981' : '#8b5cf6', fontSize: '11px', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: '99px' }}/>
                    </div>
                  </div>
                )}
              </DetailBlock>

              {/* Diet + Workout block */}
              <DetailBlock icon="🥗" title="Diet & Workout Plan" color="#f59e0b">
                {/* ── Diet ── */}
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' }}>Diet</p>
                <DetailRow label="Type">
                  {pref.dietType === 'veg'
                    ? <span className="badge badge-green" style={{ fontSize: '12px' }}>🥦 Vegetarian</span>
                    : pref.dietType === 'nonveg'
                    ? <span className="badge badge-amber" style={{ fontSize: '12px' }}>🍗 Non-Vegetarian</span>
                    : <span style={{ color: 'rgba(255,255,255,.25)' }}>Not selected</span>}
                </DetailRow>
                <DetailRow label="Save for future">
                  {pref.saveDiet
                    ? <span className="badge badge-green" style={{ fontSize: '11px' }}>✅ Saved</span>
                    : <span className="badge badge-red" style={{ fontSize: '11px' }}>⬜ Not saved</span>}
                </DetailRow>

                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '10px 0 8px' }}/>

                {/* ── Workout ── */}
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' }}>Workout</p>
                <DetailRow label="Days/Week"><span>{pref.workoutDays ? `${pref.workoutDays} days` : '—'}</span></DetailRow>
                <DetailRow label="Plan ID"><span>{pref.workoutPlanId ? `Plan ${pref.workoutPlanId}` : '—'}</span></DetailRow>
                <DetailRow label="Rest Day">
                  <span style={{ color: '#22d3ee' }}>
                    {pref.restDay ? `🌙 ${pref.restDay}` : '🌙 Sunday (default)'}
                  </span>
                </DetailRow>
                <DetailRow label="Save for future">
                  {pref.saveWorkout
                    ? <span className="badge badge-green" style={{ fontSize: '11px' }}>✅ Saved</span>
                    : <span className="badge badge-red" style={{ fontSize: '11px' }}>⬜ Not saved</span>}
                </DetailRow>

                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '10px 0 8px' }}/>

                {/* ── Progress ── */}
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '8px' }}>Progress</p>
                <DetailRow label="Current Day">
                  <span style={{ color: '#a78bfa', fontWeight: 800 }}>
                    Day {(jd.completedDays || []).length + 1}
                    {jd.totalDays ? ` of ${jd.totalDays}` : ''}
                  </span>
                </DetailRow>
                <DetailRow label="Last Completed">
                  <span style={{ color: pref.lastCompletedDay ? '#10b981' : 'rgba(255,255,255,.25)' }}>
                    {pref.lastCompletedDay ? `✅ Day ${pref.lastCompletedDay}` : '—'}
                  </span>
                </DetailRow>
                <DetailRow label="Days Done">
                  <span>{(jd.completedDays || []).length} completed</span>
                </DetailRow>

                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', margin: '10px 0 8px' }}/>

                {/* ── Prefs Timestamp ── */}
                <DetailRow label="Prefs Updated">
                  <span style={{ color: 'rgba(255,255,255,.35)', fontSize: '11px' }}>
                    {pref.prefsUpdatedAt ? fmtDateTime(pref.prefsUpdatedAt) : '—'}
                  </span>
                </DetailRow>
              </DetailBlock>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailBlock({ icon, title, color, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.025)',
      border: `1px solid ${color}25`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '16px', padding: '18px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon} {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>{children}</div>
    </div>
  );
}
function DetailRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
      <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{children}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MODAL — shows list of users (clickable stat cards)
═══════════════════════════════════════════════════════════════ */
function UsersModal({ config, onClose }) {
  if (!config) return null;
  const { title, icon, users } = config;
  const list = Array.isArray(users) ? users : [];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      animation: 'fadeIn .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '640px', maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(145deg, #0d1225, #0a0d1a)',
        border: '1px solid rgba(139,92,246,.3)', borderRadius: '28px',
        boxShadow: '0 60px 140px rgba(0,0,0,.9), 0 0 0 1px rgba(139,92,246,.15)',
        overflow: 'hidden', animation: 'fadeUp .3s ease',
      }}>
        <div style={{
          padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,.07)',
          background: 'rgba(139,92,246,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{icon}</span>
            <div>
              <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', marginBottom: '3px' }}>{title}</h2>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px' }}>{list.length} user{list.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
            color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 22px 22px' }}>
          {list.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '44px', marginBottom: '12px' }}>😴</p>
              <p style={{ color: 'rgba(255,255,255,.3)' }}>No users in this category</p>
            </div>
          ) : list.map((u, i) => {
            const [g1, g2] = avatarGrad(u.username || '?');
            return (
              <div key={String(u._id || i)} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '14px',
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                marginBottom: '10px',
              }}>
                <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '11px', minWidth: '22px', textAlign: 'right' }}>{i + 1}</span>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: `linear-gradient(135deg,${g1},${g2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '17px', fontWeight: 900, color: '#fff', flexShrink: 0,
                }}>
                  {(u.username || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{u.username}</p>
                  <p className="mono" style={{ color: 'rgba(255,255,255,.2)', fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {String(u._id)}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '11px', marginBottom: '3px' }}>{fmtDate(u.createdAt)}</p>
                  {(u.journeyData?.currentStreak ?? 0) > 0
                    ? <span className="badge badge-amber">🔥 {u.journeyData.currentStreak}d</span>
                    : <span style={{ color: 'rgba(255,255,255,.15)', fontSize: '11px' }}>No streak</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DANGER ZONE — delete all users
═══════════════════════════════════════════════════════════════ */
function DangerZone({ onDeleted }) {
  const [open, setOpen]       = useState(false);
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const doDelete = async () => {
    if (confirm.trim().toLowerCase() !== 'delete all') return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/admin/clear-all?secret=${API_SECRET}`, { method: 'DELETE' });
      const data = await res.json();
      setResult(data);
      onDeleted();
    } catch (e) {
      setResult({ message: 'Error: ' + e.message });
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.2)',
      borderRadius: '20px', padding: '26px', marginTop: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ color: '#f87171', fontWeight: 800, fontSize: '15px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Danger Zone
          </p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '13px' }}>Permanently delete ALL users and their journey history from the database.</p>
        </div>
        <button
          onClick={() => { setOpen(!open); setConfirm(''); setResult(null); }}
          className="btn-danger"
          style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px' }}
        >
          {open ? '✕ Cancel' : '🗑️ Delete All Users'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '20px', animation: 'fadeUp .25s ease both' }}>
          {result ? (
            <div style={{
              padding: '16px 20px', borderRadius: '12px',
              background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)',
              color: '#34d399', fontSize: '13px', fontWeight: 600,
            }}>
              ✅ {result.message} — Deleted {result.deletedUsers ?? 0} users, {result.deletedHistory ?? 0} history records.
            </div>
          ) : (
            <>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '13px', marginBottom: '12px' }}>
                Type <strong style={{ color: '#f87171' }}>delete all</strong> to confirm:
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder='Type "delete all"…'
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(239,68,68,.3)',
                    color: '#fff', fontSize: '14px', outline: 'none',
                  }}
                />
                <button
                  disabled={confirm.trim().toLowerCase() !== 'delete all' || loading}
                  onClick={doDelete}
                  style={{
                    padding: '12px 22px', borderRadius: '12px',
                    background: confirm.trim().toLowerCase() === 'delete all' ? 'rgba(239,68,68,.85)' : 'rgba(239,68,68,.2)',
                    border: '1px solid rgba(239,68,68,.4)',
                    color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                    transition: 'all .2s', whiteSpace: 'nowrap',
                  }}
                >
                  {loading ? '⏳ Deleting…' : '🗑️ Confirm Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOGIN GATE  (two-step)
═══════════════════════════════════════════════════════════════ */
function LoginGate({ onAuth }) {
  const [adminId, setAdminId] = useState('');
  const [pwd, setPwd]         = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep]       = useState(1);
  const [err, setErr]         = useState('');
  const [shake, setShake]     = useState(false);
  const [idOk, setIdOk]       = useState(false);

  const boom   = () => { setShake(true); setTimeout(() => setShake(false), 600); };
  const step1  = e => { e.preventDefault(); if (adminId.trim() === ADMIN_ID) { setIdOk(true); setErr(''); setStep(2); } else { setErr('Admin ID not recognized.'); boom(); setAdminId(''); }};
  const step2  = e => { e.preventDefault(); if (pwd === ADMIN_PWD) { sessionStorage.setItem(SESSION_KEY, '1'); onAuth(); } else { setErr('Incorrect password.'); boom(); setPwd(''); }};

  return (
    <div className="admin-root" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #030712 0%, #0a0118 50%, #050d1a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.08), transparent 65%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-15%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,.06), transparent 65%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'fixed', top: '40%', right: '20%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,.04), transparent 65%)', pointerEvents: 'none' }}/>

      <div style={{
        width: '100%', maxWidth: '430px', padding: '0 20px',
        position: 'relative', zIndex: 10,
        animation: shake ? 'shake .55s ease' : 'fadeUp .5s ease',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 18px',
            boxShadow: '0 0 60px rgba(139,92,246,.5)', animation: 'glow 3s infinite',
          }}>🛡️</div>
          <h1 style={{ fontWeight: 900, fontSize: '30px', letterSpacing: '-1.5px', color: '#fff', marginBottom: '6px' }}>Owner Portal</h1>
          <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '13px' }}>FitStart Admin · Two-Step Authentication</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800,
                  background: step >= s ? (s === 1 && idOk ? '#10b981' : 'linear-gradient(135deg,#8b5cf6,#ec4899)') : 'rgba(255,255,255,.07)',
                  color: step >= s ? '#fff' : 'rgba(255,255,255,.25)',
                  border: step >= s ? 'none' : '1px solid rgba(255,255,255,.1)',
                  transition: 'all .3s ease',
                }}>
                  {s === 1 && idOk ? '✓' : s}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: step >= s ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)' }}>
                  {s === 1 ? 'Admin ID' : 'Password'}
                </span>
              </div>
              {s < 2 && <div style={{ flex: 1, height: '1px', background: idOk ? 'linear-gradient(90deg,#10b981,#8b5cf6)' : 'rgba(255,255,255,.07)', transition: 'background .4s' }}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '28px', padding: '30px', backdropFilter: 'blur(30px)',
          boxShadow: '0 50px 120px rgba(0,0,0,.7)',
          animation: 'borderFlow 4s infinite',
        }}>
          {step === 1 && (
            <form onSubmit={step1}>
              <label style={{ color: 'rgba(255,255,255,.35)', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Admin ID</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '17px', pointerEvents: 'none' }}>🆔</span>
                <input
                  type="text" value={adminId} autoFocus
                  onChange={e => { setAdminId(e.target.value); setErr(''); }}
                  placeholder="Enter admin ID…"
                  style={{
                    width: '100%', padding: '15px 15px 15px 46px', borderRadius: '14px',
                    background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: '15px', outline: 'none',
                    border: `1px solid ${err ? 'rgba(239,68,68,.55)' : 'rgba(255,255,255,.12)'}`,
                    boxSizing: 'border-box', transition: 'border-color .2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = err ? 'rgba(239,68,68,.55)' : 'rgba(255,255,255,.12)'}
                />
              </div>
              {err && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>❌ {err}</p>}
              <button type="submit" className="btn-admin" style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '15px', borderRadius: '14px' }}>
                Verify ID →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={step2}>
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', marginBottom: '22px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>✅</span>
                <div>
                  <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>ID Verified: {adminId}</p>
                  <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px' }}>Enter password to unlock the dashboard</p>
                </div>
              </div>
              <label style={{ color: 'rgba(255,255,255,.35)', fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '17px', pointerEvents: 'none' }}>🔑</span>
                <input
                  type={showPwd ? 'text' : 'password'} value={pwd} autoFocus
                  onChange={e => { setPwd(e.target.value); setErr(''); }}
                  placeholder="Enter password…"
                  className="mono"
                  style={{
                    width: '100%', padding: '15px 46px 15px 46px', borderRadius: '14px',
                    background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: '15px', outline: 'none',
                    border: `1px solid ${err ? 'rgba(239,68,68,.55)' : 'rgba(255,255,255,.12)'}`,
                    boxSizing: 'border-box', transition: 'border-color .2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = err ? 'rgba(239,68,68,.55)' : 'rgba(255,255,255,.12)'}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '17px' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {err && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '8px' }}>❌ {err}</p>}
              <button type="submit" className="btn-admin" style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '15px', borderRadius: '14px' }}>
                🔓 Unlock Dashboard
              </button>
              <button type="button" onClick={() => { setStep(1); setErr(''); setPwd(''); setIdOk(false); }} className="btn-ghost" style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '14px', fontSize: '13px' }}>
                ← Change Admin ID
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.1)', fontSize: '12px', marginTop: '18px' }}>
          🔒 Restricted to site owner only
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
function AdminDashboard({ onLogout }) {
  const navigate    = useNavigate();
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [tab, setTab]               = useState('overview');
  const [modal, setModal]           = useState(null);
  const [search, setSearch]         = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/admin/stats?secret=${API_SECRET}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (e) {
      setError(`Cannot reach server (${e.message}). Make sure the backend is running on port 5000.`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const allUsers   = stats?.allUsers   || [];
  const filtered   = search.trim()
    ? allUsers.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || String(u._id).includes(search))
    : allUsers;

  const dietVeg    = stats?.dietBreakdown?.veg    || 0;
  const dietNonveg = stats?.dietBreakdown?.nonveg || 0;
  const dietTotal  = dietVeg + dietNonveg;
  const vegPct     = dietTotal > 0 ? Math.round(dietVeg    / dietTotal * 100) : 0;
  const nvgPct     = dietTotal > 0 ? Math.round(dietNonveg / dietTotal * 100) : 0;

  return (
    <div className="admin-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050818,#080d20,#050818)' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.055),transparent 65%)', pointerEvents: 'none', zIndex: 0 }}/>
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,.04),transparent 65%)', pointerEvents: 'none', zIndex: 0 }}/>
      <div style={{ position: 'fixed', top: '35%', left: '30%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,.025),transparent 65%)', pointerEvents: 'none', zIndex: 0 }}/>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: '64px',
        background: 'rgba(5,8,24,.92)', backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255,255,255,.055)',
        boxShadow: '0 4px 40px rgba(0,0,0,.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '11px',
            background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            boxShadow: '0 4px 20px rgba(139,92,246,.4)',
          }}>🛡️</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontWeight: 900, fontSize: '18px', letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>FitStart</span>
            <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '14px', fontWeight: 400 }}>/ Admin</span>
          </div>
          <div className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}/>
            chinmay2115
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastRefresh && <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '11px' }}>Updated {timeAgo(lastRefresh)}</span>}
          <NavBtn onClick={() => navigate('/login')} color="#22d3ee">← Login Page</NavBtn>
          <NavBtn onClick={fetchStats} color="#a78bfa" disabled={loading}>
            <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>↻</span> Refresh
          </NavBtn>
          <NavBtn onClick={onLogout} color="#f87171">🔒 Lock</NavBtn>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px', position: 'relative', zIndex: 1 }}>

        {/* Page header + tab switcher */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ animation: 'fadeUp .4s ease' }}>
            <p style={{ color: 'rgba(255,255,255,.22)', fontSize: '11px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Owner View · Full Access
            </p>
            <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>
              FitStart{' '}
              <span style={{
                background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Analytics</span>
            </h1>
          </div>
          <div style={{
            display: 'flex', gap: '5px', background: 'rgba(255,255,255,.04)',
            borderRadius: '14px', padding: '5px', border: '1px solid rgba(255,255,255,.07)',
            animation: 'fadeUp .4s ease .1s both',
          }}>
            {[['overview','📊 Overview'],['users','👥 All Users']].map(([v, l]) => (
              <button key={v} onClick={() => { setTab(v); setSearch(''); setExpandedId(null); }}
                style={{
                  padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all .2s',
                  background: tab === v ? 'linear-gradient(135deg,#8b5cf6,#ec4899)' : 'transparent',
                  color: tab === v ? '#fff' : 'rgba(255,255,255,.35)',
                  boxShadow: tab === v ? '0 4px 20px rgba(139,92,246,.4)' : 'none',
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#f87171', marginBottom: '28px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading shimmer */}
        {loading && !stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                height: '160px', borderRadius: '24px', overflow: 'hidden',
                background: 'linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.03) 75%)',
                backgroundSize: '400% 100%', animation: 'shimmer 1.8s infinite',
              }}/>
            ))}
          </div>
        )}

        {/* ══════════ OVERVIEW TAB ══════════ */}
        {stats && tab === 'overview' && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginBottom: '28px' }}>
              <StatCard icon="👥" label="Total Members" value={stats.totalUsers} color1="#8b5cf6" color2="#ec4899"
                sub={`${stats.allUsers?.length ?? 0} accounts registered`} delay={0}
                onClick={() => setModal({ title: 'All Members', icon: '👥', users: stats.allUsers })}/>
              <StatCard icon="✨" label="New This Week" value={stats.newUsersThisWeek} color1="#10b981" color2="#06b6d4"
                sub={`${stats.newUsers?.length ?? 0} joined recently`} delay={80}
                onClick={() => setModal({ title: 'New This Week', icon: '✨', users: stats.newUsers })}/>
              <StatCard icon="⚡" label="Active (7 days)" value={stats.recentlyActive} color1="#f59e0b" color2="#ef4444"
                sub={`${stats.activeUsers?.length ?? 0} recently active`} delay={160}
                onClick={() => setModal({ title: 'Active Accounts', icon: '⚡', users: stats.activeUsers })}/>
            </div>

            {/* ── DIET PREFERENCE BREAKDOWN ── */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(145deg, rgba(13,18,37,.95), rgba(8,12,28,.98))',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: '28px', padding: '32px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)',
              animation: 'fadeUp .5s ease .25s both',
            }}>
              {/* Ambient background glows */}
              <div style={{ position: 'absolute', top: '-60px', left: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,.09), transparent 65%)', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.07), transparent 65%)', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.04), transparent 65%)', pointerEvents: 'none' }}/>

              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,.25), rgba(245,158,11,.2))',
                      border: '1px solid rgba(255,255,255,.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                      boxShadow: '0 4px 16px rgba(16,185,129,.15)',
                    }}>🥗</div>
                    <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '10px', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' }}>
                      Diet Preference Breakdown
                    </p>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '16px', fontWeight: 700, letterSpacing: '-.2px' }}>
                    Which diet is more popular among users?
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: '14px', padding: '12px 18px', textAlign: 'right',
                }}>
                  <p style={{
                    fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1,
                    background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{dietTotal}</p>
                  <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '10px', marginTop: '3px', fontWeight: 600 }}>
                    of {stats.totalUsers || 0} users chose a plan
                  </p>
                </div>
              </div>

              {/* ── Side-by-side diet cards ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch', marginBottom: '26px', position: 'relative', zIndex: 1 }}>

                {/* ── VEG CARD ── */}
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  background: vegPct >= nvgPct && dietTotal > 0
                    ? 'linear-gradient(145deg, rgba(16,185,129,.13), rgba(6,182,212,.07))'
                    : 'rgba(16,185,129,.04)',
                  border: `1px solid ${vegPct >= nvgPct && dietTotal > 0 ? 'rgba(16,185,129,.45)' : 'rgba(16,185,129,.12)'}`,
                  borderRadius: '22px', padding: '24px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: vegPct >= nvgPct && dietTotal > 0
                    ? '0 12px 48px rgba(16,185,129,.18), inset 0 1px 0 rgba(16,185,129,.15)'
                    : '0 4px 20px rgba(0,0,0,.3)',
                  transition: 'all .5s cubic-bezier(.22,1,.36,1)',
                }}>
                  {/* Card ambient glow */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,.18), transparent 65%)', pointerEvents: 'none' }}/>

                  {/* LEADING badge */}
                  {vegPct > nvgPct && dietTotal > 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                      borderRadius: '99px', padding: '4px 12px',
                      fontSize: '9px', fontWeight: 900, color: '#fff', letterSpacing: '.1em',
                      boxShadow: '0 4px 16px rgba(16,185,129,.4)',
                      animation: 'pulse 2s infinite',
                    }}>👑 LEADING</div>
                  )}

                  {/* Neon icon */}
                  <div style={{
                    width: '58px', height: '58px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,.2), rgba(6,182,212,.15))',
                    border: '1px solid rgba(16,185,129,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', marginBottom: '18px',
                    boxShadow: '0 0 24px rgba(16,185,129,.3), 0 8px 24px rgba(16,185,129,.15)',
                  }}>🥦</div>

                  <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '10px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Vegetarian
                  </p>

                  {/* Big percentage */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '64px', fontWeight: 900, letterSpacing: '-4px', lineHeight: 1,
                      background: 'linear-gradient(135deg,#10b981,#34d399,#06b6d4)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      filter: vegPct >= nvgPct && dietTotal > 0 ? 'drop-shadow(0 0 20px rgba(16,185,129,.5))' : 'none',
                      display: 'inline-block',
                    }}>{vegPct}</span>
                    <span style={{
                      fontSize: '26px', fontWeight: 700,
                      background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>%</span>
                  </div>

                  {/* User count pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.28)',
                    borderRadius: '99px', padding: '5px 14px', marginBottom: '18px',
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }}/>
                    <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 800 }}>
                      {dietVeg} User{dietVeg !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div style={{ height: '5px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${vegPct}%`,
                      background: 'linear-gradient(90deg,#10b981,#06b6d4)',
                      borderRadius: '99px', transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
                      boxShadow: '0 0 10px rgba(16,185,129,.5)',
                    }}/>
                  </div>
                </div>

                {/* ── VS divider ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(236,72,153,.12))',
                    border: '1px solid rgba(255,255,255,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 900,
                    color: 'rgba(255,255,255,.25)',
                    boxShadow: '0 0 20px rgba(139,92,246,.1)',
                  }}>VS</div>
                  <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom,transparent,rgba(255,255,255,.08),transparent)' }}/>
                  {dietTotal === 0 && <p style={{ color: 'rgba(255,255,255,.12)', fontSize: '9px', textAlign: 'center', maxWidth: '44px', lineHeight: 1.3 }}>no data yet</p>}
                </div>

                {/* ── NON-VEG CARD ── */}
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  background: nvgPct > vegPct && dietTotal > 0
                    ? 'linear-gradient(145deg, rgba(245,158,11,.13), rgba(239,68,68,.07))'
                    : 'rgba(245,158,11,.04)',
                  border: `1px solid ${nvgPct > vegPct && dietTotal > 0 ? 'rgba(245,158,11,.45)' : 'rgba(245,158,11,.12)'}`,
                  borderRadius: '22px', padding: '24px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: nvgPct > vegPct && dietTotal > 0
                    ? '0 12px 48px rgba(245,158,11,.18), inset 0 1px 0 rgba(245,158,11,.12)'
                    : '0 4px 20px rgba(0,0,0,.3)',
                  transition: 'all .5s cubic-bezier(.22,1,.36,1)',
                }}>
                  {/* Card ambient glow */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.16), transparent 65%)', pointerEvents: 'none' }}/>

                  {/* LEADING badge */}
                  {nvgPct > vegPct && dietTotal > 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                      borderRadius: '99px', padding: '4px 12px',
                      fontSize: '9px', fontWeight: 900, color: '#fff', letterSpacing: '.1em',
                      boxShadow: '0 4px 16px rgba(245,158,11,.4)',
                      animation: 'pulse 2s infinite',
                    }}>👑 LEADING</div>
                  )}

                  {/* Neon icon */}
                  <div style={{
                    width: '58px', height: '58px', borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,.2), rgba(239,68,68,.15))',
                    border: '1px solid rgba(245,158,11,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', marginBottom: '18px',
                    boxShadow: '0 0 24px rgba(245,158,11,.3), 0 8px 24px rgba(245,158,11,.15)',
                  }}>🍗</div>

                  <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '10px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Non-Vegetarian
                  </p>

                  {/* Big percentage */}
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '64px', fontWeight: 900, letterSpacing: '-4px', lineHeight: 1,
                      background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#ef4444)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      filter: nvgPct > vegPct && dietTotal > 0 ? 'drop-shadow(0 0 20px rgba(245,158,11,.5))' : 'none',
                      display: 'inline-block',
                    }}>{nvgPct}</span>
                    <span style={{
                      fontSize: '26px', fontWeight: 700,
                      background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>%</span>
                  </div>

                  {/* User count pill */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)',
                    borderRadius: '99px', padding: '5px 14px', marginBottom: '18px',
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b', display: 'inline-block' }}/>
                    <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 800 }}>
                      {dietNonveg} User{dietNonveg !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div style={{ height: '5px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${nvgPct}%`,
                      background: 'linear-gradient(90deg,#f59e0b,#ef4444)',
                      borderRadius: '99px', transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
                      boxShadow: '0 0 10px rgba(245,158,11,.5)',
                    }}/>
                  </div>
                </div>
              </div>

              {/* ── Dual-color comparison bar ── */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg,#10b981,#06b6d4)', display: 'inline-block', boxShadow: '0 0 8px rgba(16,185,129,.5)' }}/>
                    <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 700 }}>🥦 Vegetarian · {dietVeg} users</span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,.18)', fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Comparison Ratio</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>Non-Vegetarian · {dietNonveg} users 🍗</span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'inline-block', boxShadow: '0 0 8px rgba(245,158,11,.5)' }}/>
                  </div>
                </div>

                {/* The bar itself */}
                <div style={{
                  height: '14px', borderRadius: '99px', overflow: 'hidden',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.07)',
                  display: 'flex',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,.3)',
                }}>
                  <div style={{
                    width: dietTotal > 0 ? `${vegPct}%` : '50%',
                    background: 'linear-gradient(90deg,#10b981,#06b6d4)',
                    transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
                    borderRadius: dietNonveg === 0 ? '99px' : '99px 0 0 99px',
                    boxShadow: '0 0 14px rgba(16,185,129,.5)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.15) 50%,transparent 100%)',
                      animation: 'shimmer 2.5s infinite',
                      backgroundSize: '200% 100%',
                    }}/>
                  </div>
                  <div style={{
                    width: dietTotal > 0 ? `${nvgPct}%` : '50%',
                    background: 'linear-gradient(90deg,#f59e0b,#ef4444)',
                    transition: 'width 1.2s cubic-bezier(.22,1,.36,1)',
                    borderRadius: dietVeg === 0 ? '99px' : '0 99px 99px 0',
                    boxShadow: '0 0 14px rgba(245,158,11,.5)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.12) 50%,transparent 100%)',
                      animation: 'shimmer 2.5s infinite .8s',
                      backgroundSize: '200% 100%',
                    }}/>
                  </div>
                </div>

                {/* Percentage ticks */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ color: 'rgba(16,185,129,.6)', fontSize: '10px', fontWeight: 700 }}>{vegPct}%</span>
                  <span style={{ color: 'rgba(245,158,11,.6)', fontSize: '10px', fontWeight: 700 }}>{nvgPct}%</span>
                </div>
              </div>

              {/* Footer insight */}
              <div style={{
                marginTop: '20px', padding: '14px 18px', borderRadius: '14px',
                background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)',
                position: 'relative', zIndex: 1,
              }}>
                <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px', textAlign: 'center', lineHeight: 1.6 }}>
                  {dietTotal === 0
                    ? '📊 No diet plans chosen yet — data will populate as users sign up and save their plan.'
                    : vegPct === nvgPct
                    ? `⚖️ It's a perfect tie! ${dietVeg} vegetarian vs ${dietNonveg} non-vegetarian users.`
                    : vegPct > nvgPct
                    ? `🥦 Vegetarians lead by ${vegPct - nvgPct}% — ${dietVeg} veg users vs ${dietNonveg} non-veg users (${nvgPct}%)`
                    : `🍗 Non-vegetarians lead by ${nvgPct - vegPct}% — ${dietNonveg} non-veg users vs ${dietVeg} veg users (${vegPct}%)`
                  }
                </p>
              </div>
            </div>
          </>
        )}

        {/* ══════════ ALL USERS TAB ══════════ */}
        {stats && tab === 'users' && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            {/* Search bar */}
            <div style={{ background: 'rgba(255,255,255,.022)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '20px', padding: '20px 22px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'rgba(255,255,255,.25)', pointerEvents: 'none' }}>🔍</span>
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setExpandedId(null); }}
                    placeholder="Search by username or user ID…"
                    style={{
                      width: '100%', padding: '13px 14px 13px 44px', borderRadius: '14px',
                      background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.1)',
                      color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color .2s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}
                  />
                </div>
                {search && (
                  <button onClick={() => { setSearch(''); setExpandedId(null); }} style={{
                    padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,.1)',
                    background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: '13px',
                  }}>✕ Clear</button>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,.2)', fontSize: '11px', marginTop: '10px' }}>
                Showing {filtered.length} of {allUsers.length} users · Click any row to expand full details
              </p>
            </div>

            {/* Table */}
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)' }}>
                      {['#', 'User', 'Joined', 'Journey', 'Streak', 'Diet', 'Workout', ''].map((h, i) => (
                        <th key={i} style={{
                          padding: '13px 16px', textAlign: 'left', fontSize: '10px',
                          fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,.22)', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: '14px' }}>
                        {search ? `No users matching "${search}"` : 'No users registered yet.'}
                      </td></tr>
                    ) : filtered.map((u, i) => (
                      <UserRow
                        key={String(u._id)}
                        user={u}
                        idx={i}
                        isExpanded={expandedId === String(u._id)}
                        onToggle={() => setExpandedId(prev => prev === String(u._id) ? null : String(u._id))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danger zone */}
            <DangerZone onDeleted={fetchStats} />
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <UsersModal config={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ── NavBtn helper ── */
function NavBtn({ children, onClick, color, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '8px 14px', borderRadius: '10px',
        border: `1px solid ${color}44`, fontSize: '12px', fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        background: hov ? `${color}18` : `${color}0a`,
        color, transition: 'all .2s',
        opacity: disabled ? .5 : 1,
        display: 'flex', alignItems: 'center', gap: '5px',
      }}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  return (
    <>
      <StyleInjector />
      {authed
        ? <AdminDashboard onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />
        : <LoginGate onAuth={() => setAuthed(true)} />}
    </>
  );
}
