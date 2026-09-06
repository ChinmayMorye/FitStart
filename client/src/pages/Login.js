import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Pre-warm the backend as soon as login page loads
  useEffect(() => {
    fetch(`${API_BASE}/health`).catch(() => {});
  }, []);

  // ── Login with auto-retry for Render cold start ─────────────────────────────
  const fetchWithTimeout = (url, options, timeout = 65000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, options)
        .then(res => { clearTimeout(timer); resolve(res); })
        .catch(err => { clearTimeout(timer); reject(err); });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        if (attempts > 0) {
          setError('⏳ Server is waking up, please wait...');
          await new Promise(r => setTimeout(r, 5000));
        }

        const res = await fetchWithTimeout(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('server_offline');
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid credentials');

        localStorage.setItem('fitstart_token', data.token);
        localStorage.setItem('fitstart_user', JSON.stringify(data.user));
        onLoginSuccess({ user: data.user, token: data.token });
        setLoading(false);
        return;
      } catch (err) {
        attempts++;
        const msg = err.message || '';
        const isNetworkError = msg === 'server_offline' || msg === 'timeout' ||
          msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed to fetch');

        if (isNetworkError && attempts < maxAttempts) {
          setError('⏳ Server is starting up (free tier cold start). Retrying...');
          continue;
        }

        if (isNetworkError) {
          setError('❌ Server is unreachable. It may still be waking up — please try again in 30 seconds.');
        } else {
          setError(msg || 'Login failed. Please check your credentials.');
        }
        break;
      }
    }
    setLoading(false);
  };
  // ────────────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%',
    padding: '13px 14px 13px 44px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#F0F4FF',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    caretColor: '#00F5FF',
    boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden relative">

      {/* ── Global Background ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(0,245,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.018) 1px, transparent 1px)',
        backgroundSize: '70px 70px',
      }} />

      {/* ── LEFT PANEL: Branding ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        {/* Panel background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #020b14 0%, #050d1c 50%, #020408 100%)' }} />

        {/* Orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />

        {/* Cyber grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.022) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Animated accent line on the right edge */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '1px', height: '100%',
          background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.3) 30%, rgba(124,58,237,0.3) 70%, transparent)',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00F5FF, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '20px', fontFamily: "'Syne', sans-serif",
            boxShadow: '0 0 28px rgba(0,245,255,0.5)',
          }}>F</div>
          <span className="text-white font-black text-2xl tracking-tighter"
            style={{ fontFamily: "'Syne', sans-serif", textShadow: '0 0 24px rgba(0,245,255,0.35)' }}>
            FITSTART
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Live indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.18)',
            fontSize: '10px', fontWeight: 700, color: '#00F5FF',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace", width: 'fit-content', marginBottom: '-4px',
          }}>
            <span style={{ width: '6px', height: '6px', background: '#00F5FF', borderRadius: '50%', animation: 'ping-slow 2s infinite', display: 'inline-block' }} />
            The #1 Fitness Platform
          </div>

          {/* Headline */}
          <div>
            <h2 style={{
              fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-2.5px', color: '#F0F4FF', marginBottom: '14px',
              fontFamily: "'Syne', sans-serif",
            }}>
              Build the body<br />
              <span style={{
                background: 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 80%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>you deserve.</span>
            </h2>
            <p style={{ color: 'rgba(180,200,240,0.38)', fontSize: '15px', lineHeight: 1.65, maxWidth: '310px' }}>
              Your stats, workouts, and nutrition — all in one place. Built for champions.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { val: '10K+', label: 'Athletes',    color: '#00F5FF', glow: 'rgba(0,245,255,0.18)' },
              { val: '500+', label: 'Workouts',    color: '#00FF87', glow: 'rgba(0,255,135,0.15)'  },
              { val: '98%',  label: 'Satisfaction', color: '#7C3AED', glow: 'rgba(124,58,237,0.18)' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '14px 16px', borderRadius: '14px',
                background: `${s.glow}`,
                border: `1px solid ${s.color}25`,
                boxShadow: `0 0 20px ${s.glow}`,
                flex: 1, textAlign: 'center',
              }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, letterSpacing: '-1px', fontFamily: "'Space Mono', monospace", textShadow: `0 0 14px ${s.color}60` }}>{s.val}</p>
                <p style={{ fontSize: '9px', color: 'rgba(180,200,240,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['🥗 Smart Nutrition', '🏋️ Custom Workouts', '🔥 Streak Tracking', '📊 BMI Insights'].map((f) => (
              <div key={f} style={{
                padding: '6px 14px', borderRadius: '100px', fontSize: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(240,244,255,0.55)', fontWeight: 600,
              }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10" style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
            "The only bad workout is the one that didn't happen."
          </p>
          <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: '11px', marginTop: '4px', fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Space Mono', monospace" }}>— Unknown Champion</p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative" style={{ zIndex: 1 }}>
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)' }} />

        <div className="w-full max-w-md relative z-10" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) both' }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-white font-black text-3xl tracking-tighter"
              style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #00F5FF, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              FITSTART
            </span>
          </div>

          {/* Card */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'rgba(4,9,20,0.92)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 0 1px rgba(0,245,255,0.04), 0 32px 90px rgba(0,0,0,0.85), 0 0 80px rgba(0,245,255,0.04)',
          }}>

            {/* Animated top accent bar */}
            <div style={{
              height: '2px',
              background: 'linear-gradient(90deg, #00F5FF, #7C3AED, #00FF87)',
              backgroundSize: '200% 100%',
              animation: 'borderSpin 4s linear infinite',
            }} />

            <div style={{ padding: '32px' }}>

              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00F5FF, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                  boxShadow: '0 0 28px rgba(0,245,255,0.4)',
                }}>
                  <svg style={{ width: '22px', height: '22px', color: '#000' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#F0F4FF', letterSpacing: '-0.8px', fontFamily: "'Syne', sans-serif", margin: 0 }}>
                  Welcome back
                </h1>
                <p style={{ color: 'rgba(180,200,240,0.4)', fontSize: '14px', marginTop: '6px' }}>
                  Sign in to continue your journey
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div className="animate-shake" style={{
                  marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.35)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.1)',
                }}>
                  <svg style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                  <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Username field */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.18em',
                    color: 'rgba(0,245,255,0.7)', marginBottom: '8px',
                    fontFamily: "'Space Mono', monospace",
                  }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                      </svg>
                    </div>
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username"
                      autoComplete="username"
                      className="input-neon"
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08), 0 0 20px rgba(0,245,255,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{
                      display: 'block', fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.18em',
                      color: 'rgba(124,58,237,0.8)',
                      fontFamily: "'Space Mono', monospace",
                    }}>Password</label>
                    <button type="button" style={{
                      fontSize: '11px', color: 'rgba(0,245,255,0.45)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#00F5FF'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,245,255,0.45)'}
                    >Forgot password?</button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="input-neon"
                      style={{ ...inputStyle, paddingRight: '44px' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08), 0 0 20px rgba(124,58,237,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(180,200,240,0.3)', transition: 'color 0.2s', padding: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(180,200,240,0.7)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,200,240,0.3)'}
                    >
                      {showPassword ? (
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: '12px', border: 'none',
                    background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 55%, #a855f7 100%)',
                    backgroundSize: '200% 200%',
                    animation: loading ? 'none' : 'gradientShift 4s ease infinite',
                    color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
                    fontSize: '14px', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 24px rgba(0,245,255,0.3)',
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                    letterSpacing: '0.03em', marginTop: '4px',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(0,245,255,0.45)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(0,245,255,0.3)'; }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <svg style={{ width: '16px', height: '16px', animation: 'rotateGlow 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      Sign In
                      <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ color: 'rgba(180,200,240,0.25)', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>NEW HERE?</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Sign up link */}
              <button
                onClick={() => navigate('/signup')}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(0,245,255,0.15)',
                  color: 'rgba(180,200,240,0.65)',
                  fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.35)'; e.currentTarget.style.color = '#F0F4FF'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,245,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.15)'; e.currentTarget.style.color = 'rgba(180,200,240,0.65)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Create an account →
              </button>

            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: 'rgba(180,200,240,0.18)', fontSize: '11px', marginTop: '20px', fontFamily: "'Space Mono', monospace" }}>
            By signing in you agree to our{' '}
            <span style={{ color: 'rgba(0,245,255,0.3)', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
            {' & '}
            <span style={{ color: 'rgba(0,245,255,0.3)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy</span>
          </p>



        </div>
      </div>
    </div>
  );
};

export default Login;