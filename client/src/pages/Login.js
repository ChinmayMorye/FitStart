import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

/* ─── Inline SVG Icons (Lucide-style, no emoji as icons) ─── */
function IconUser({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconLock({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEye({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconArrow({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconAlert({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconDumbbell({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5v14M18 5v14" /><rect x="3" y="7" width="6" height="10" rx="1" /><rect x="15" y="7" width="6" height="10" rx="1" /><line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}
function IconFlame({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  );
}
function IconChart({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconNutrition({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" />
    </svg>
  );
}

/* ─── Brand tokens ─── */
// eslint-disable-next-line no-unused-vars
const T = {
  bgBase:       '#0A0A0F',
  bgSurface:    '#14141B',
  border:       '#26262F',
  border2:      '#32323E',
  textPrimary:  '#FFFFFF',
  textSecondary:'#A1A1AA',
  textMuted:    '#6B6B76',
  lime:         '#B6FF3C',
  cyan:         '#00E5FF',
  orange:       '#FF7A00',
  gradCta:      'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
};

const inputBase = {
  width: '100%',
  padding: '13px 14px 13px 44px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid #26262F',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  caretColor: '#00E5FF',
  boxSizing: 'border-box',
};

const FEATURES = [
  { Icon: IconNutrition, text: 'Smart daily meal plans',       color: '#B6FF3C' },
  { Icon: IconDumbbell,  text: 'Custom workout routines',      color: '#00E5FF' },
  { Icon: IconFlame,     text: 'Daily streak & habit tracker', color: '#FF7A00' },
  { Icon: IconChart,     text: 'BMI & progress insights',      color: '#B6FF3C' },
];

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const warmUp = async () => { try { await fetch(`${API_BASE}/health`, { method: 'GET' }); } catch { } };
    warmUp();
  }, []);

  const fetchWithTimeout = (url, options, timeout = 65000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, options).then(res => { clearTimeout(timer); resolve(res); }).catch(err => { clearTimeout(timer); reject(err); });
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    let attempts = 0;
    while (attempts < 2) {
      try {
        if (attempts > 0) { setError('Server is waking up, please wait...'); await new Promise(r => setTimeout(r, 5000)); }
        const res = await fetchWithTimeout(`${API_BASE}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('server_offline');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid credentials');
        localStorage.setItem('fitstart_token', data.token);
        localStorage.setItem('fitstart_user', JSON.stringify(data.user));
        onLoginSuccess({ user: data.user, token: data.token });
        setLoading(false); return;
      } catch (err) {
        attempts++;
        const msg = err.message || '';
        const isNet = msg === 'server_offline' || msg === 'timeout' || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed to fetch');
        if (isNet && attempts < 2) { setError('Server is starting up. Retrying...'); continue; }
        setError(isNet ? 'Server unreachable. It may be waking up - try again in 30 seconds.' : msg || 'Login failed. Please check your credentials.');
        break;
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media (min-width: 1024px) { .login-left { display: flex !important; } .login-right { width: 50% !important; } .login-mobile-logo { display: none !important; } }
        .login-icon-abs { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 65% 55% at 20% 50%, rgba(182,255,60,0.05) 0%, transparent 60%), radial-gradient(ellipse 55% 65% at 80% 50%, rgba(0,229,255,0.05) 0%, transparent 60%)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 70% at center, black 40%, transparent 90%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at center, black 40%, transparent 90%)' }} />

      {/* LEFT: Branding (desktop only) */}
      <div className="login-left" style={{ display: 'none', width: '50%', position: 'relative', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #0D0D14 0%, #0A0A0F 100%)', borderRight: '1px solid #26262F' }} />
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,60,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(182,255,60,0.25) 30%, rgba(0,229,255,0.2) 70%, transparent)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#0A0A0F', boxShadow: '0 0 24px rgba(182,255,60,0.35)' }}>F</div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>FitStart</span>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(182,255,60,0.07)', border: '1px solid rgba(182,255,60,0.22)', fontSize: '11px', fontWeight: 700, color: '#B6FF3C', letterSpacing: '0.16em', textTransform: 'uppercase', width: 'fit-content' }}>
            <span style={{ width: '6px', height: '6px', background: '#B6FF3C', borderRadius: '50%', boxShadow: '0 0 8px #B6FF3C', display: 'inline-block' }} />
            Your Fitness Companion
          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-1.5px', color: '#FFFFFF', marginBottom: '14px' }}>
              Build the body{' '}
              <span style={{ background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>you deserve.</span>
            </h2>
            <p style={{ color: '#6B6B76', fontSize: '15px', lineHeight: 1.65, maxWidth: '300px' }}>Your stats, workouts, and nutrition — all in one place. Built for champions.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ val: '10K+', label: 'Athletes', color: '#B6FF3C' }, { val: '500+', label: 'Workouts', color: '#00E5FF' }, { val: '98%', label: 'Success', color: '#FF7A00' }].map((s) => (
              <div key={s.label} style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, letterSpacing: '-0.5px', fontFamily: "'Space Mono', monospace" }}>{s.val}</p>
                <p style={{ fontSize: '10px', color: '#6B6B76', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FEATURES.map(({ Icon, text, color }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ color: '#A1A1AA', fontSize: '14px', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, paddingTop: '16px', borderTop: '1px solid #26262F' }}>
          <p style={{ color: '#6B6B76', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>"The only bad workout is the one that did not happen."</p>
          <p style={{ color: '#6B6B76', fontSize: '11px', marginTop: '4px', fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Space Mono', monospace" }}>- Unknown Champion</p>
        </div>
      </div>

      {/* RIGHT: Login form */}
      <div className="login-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: '#0A0A0F' }}>F</div>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>FitStart</span>
            </div>
          </div>

          {/* Card */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#14141B', border: '1px solid #26262F', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            <div style={{ height: '2px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)' }} />
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 28px rgba(182,255,60,0.3)' }}>
                  <IconUser size={22} color="#0A0A0F" />
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2 }}>Welcome back</h1>
                <p style={{ color: '#A1A1AA', fontSize: '15px', marginTop: '6px', lineHeight: 1.5 }}>Sign in to continue your journey</p>
              </div>

              {error && (
                <div className="animate-shake" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <IconAlert size={16} color="#f87171" />
                  <p style={{ color: '#f87171', fontSize: '14px', fontWeight: 500, margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="login-username" style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A1A1AA', marginBottom: '8px' }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <span className="login-icon-abs"><IconUser size={16} color="#6B6B76" /></span>
                    <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" autoComplete="username" style={inputBase}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = '#26262F'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A1A1AA' }}>Password</label>
                    <button type="button" style={{ fontSize: '12px', color: '#6B6B76', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#00E5FF'} onMouseLeave={e => e.currentTarget.style.color = '#6B6B76'}>Forgot password?</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span className="login-icon-abs"><IconLock size={16} color="#6B6B76" /></span>
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="..." autoComplete="current-password" style={{ ...inputBase, paddingRight: '44px' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = '#26262F'; e.target.style.boxShadow = 'none'; }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B76', transition: 'color 0.2s', padding: 0, minHeight: '44px', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'} onMouseLeave={e => e.currentTarget.style.color = '#6B6B76'}>
                      {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>

                <button id="login-submit" type="submit" disabled={loading}
                  style={{ width: '100%', padding: '15px', borderRadius: '100px', border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', color: loading ? '#6B6B76' : '#0A0A0F', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 24px rgba(182,255,60,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', letterSpacing: '0.01em', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '52px' }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(182,255,60,0.45)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(182,255,60,0.3)'; }}>
                  {loading ? (
                    <><svg style={{ width: '16px', height: '16px', animation: 'rotateGlow 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Authenticating...</>
                  ) : (<>Sign In <IconArrow size={16} color="#0A0A0F" /></>)}
                </button>
              </form>

              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: '#26262F' }} />
                <span style={{ color: '#6B6B76', fontSize: '11px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em' }}>NEW HERE?</span>
                <div style={{ flex: 1, height: '1px', background: '#26262F' }} />
              </div>

              <button onClick={() => navigate('/signup')}
                style={{ width: '100%', padding: '14px', borderRadius: '100px', background: 'transparent', border: '1px solid #32323E', color: '#A1A1AA', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s ease', minHeight: '52px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(0,229,255,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#32323E'; e.currentTarget.style.color = '#A1A1AA'; e.currentTarget.style.background = 'transparent'; }}>
                Create an account →
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#6B6B76', fontSize: '12px', marginTop: '20px', fontFamily: "'Space Mono', monospace", lineHeight: 1.5 }}>
            By signing in you agree to our{' '}
            <span style={{ color: '#00E5FF', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
            {' & '}
            <span style={{ color: '#00E5FF', cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
