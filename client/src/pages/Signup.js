import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Pre-warm backend on page load so signup feels instant ─────────────────
  useEffect(() => {
    const warmUp = async () => {
      try {
        await fetch(`${API_BASE}/health`, { method: 'GET' });
      } catch {
        // silently fail
      }
    };
    warmUp();
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ── All backend logic completely unchanged ──────────────────────────────────
  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password.length > 12) {
      setError('Password must be at most 12 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setStep(2);
  };

  const fetchWithTimeout = (url, options, timeout = 65000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, options)
        .then(res => { clearTimeout(timer); resolve(res); })
        .catch(err => { clearTimeout(timer); reject(err); });
    });
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.age || !formData.height || !formData.weight) {
      setError('Please fill in all your stats.');
      return;
    }
    if (formData.age < 10 || formData.age > 120) {
      setError('Please enter a valid age.');
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

        const res = await fetchWithTimeout(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password,
            age: Number(formData.age),
            height: Number(formData.height),
            weight: Number(formData.weight),
          }),
        });

        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('server_offline');

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        const loginRes = await fetchWithTimeout(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username.trim(), password: formData.password }),
        });
        const lct = loginRes.headers.get('content-type') || '';
        if (!lct.includes('application/json')) throw new Error('server_offline');

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || 'Auto-login failed');

        onSignupSuccess({ user: loginData.user, token: loginData.token });
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
          setError('❌ Server is starting up. Please wait 30 seconds and try again.');
        } else {
          setError(msg || 'Something went wrong. Please try again.');
        }
        break;
      }
    }
    setLoading(false);
  };

  const strengthScore = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (p.length > 12) return 0;
    return score;
  };

  const strengthLabel = () => {
    const p = formData.password;
    if (p && p.length > 12) return { label: 'Too Long', color: '#ef4444' };
    const s = strengthScore();
    if (s <= 1) return { label: 'Weak', color: '#ef4444' };
    if (s <= 3) return { label: 'Fair', color: '#FFB800' };
    return { label: 'Strong', color: '#00FF87' };
  };
  // ────────────────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 44px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#F0F4FF',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    caretColor: '#7C3AED',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '10px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.18em',
    color: 'rgba(124,58,237,0.75)', marginBottom: '7px',
    fontFamily: "'Space Mono', monospace",
  };

  const s = strengthLabel();
  const score = strengthScore();

  return (
    <div className="min-h-screen bg-[#020408] flex overflow-hidden relative">

      {/* Global background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(124,58,237,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 20% 50%, rgba(0,245,255,0.05) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.018) 1px, transparent 1px)',
        backgroundSize: '70px 70px',
      }} />

      {/* ── LEFT PANEL: Sign Up Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative order-2 lg:order-1" style={{ zIndex: 1 }}>

        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
        }} />

        <div className="w-full max-w-md relative z-10" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) both' }}>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="font-black text-3xl tracking-tighter" style={{
              fontFamily: "'Syne', sans-serif",
              background: 'linear-gradient(135deg, #7C3AED, #00F5FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>FITSTART</span>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            {[1, 2].map((i) => (
              <React.Fragment key={i}>
                <div style={{
                  height: '4px', borderRadius: '99px',
                  transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                  width: step >= i ? '52px' : '16px',
                  background: step >= i
                    ? (i === 1 ? 'linear-gradient(90deg, #7C3AED, #00F5FF)' : 'linear-gradient(90deg, #00F5FF, #00FF87)')
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: step >= i ? (i === 1 ? '0 0 12px rgba(124,58,237,0.6)' : '0 0 12px rgba(0,245,255,0.5)') : 'none',
                }} />
              </React.Fragment>
            ))}
            <span style={{
              fontSize: '10px', color: 'rgba(180,200,240,0.3)',
              fontWeight: 700, marginLeft: '4px', letterSpacing: '0.1em',
              fontFamily: "'Space Mono', monospace",
            }}>STEP {step}/2</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'rgba(4,9,20,0.92)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.05), 0 32px 90px rgba(0,0,0,0.85), 0 0 60px rgba(124,58,237,0.05)',
          }}>
            {/* Animated accent bar */}
            <div style={{
              height: '2px',
              background: step === 1
                ? 'linear-gradient(90deg, #7C3AED, #00F5FF, #FF0080)'
                : 'linear-gradient(90deg, #00F5FF, #00FF87, #7C3AED)',
              backgroundSize: '200% 100%',
              animation: 'borderSpin 4s linear infinite',
              transition: 'background 0.5s ease',
            }} />

            <div style={{ padding: '32px' }}>

              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: step === 1
                    ? 'linear-gradient(135deg, #7C3AED, #FF0080)'
                    : 'linear-gradient(135deg, #00F5FF, #00FF87)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                  boxShadow: step === 1 ? '0 0 28px rgba(124,58,237,0.5)' : '0 0 28px rgba(0,245,255,0.45)',
                  transition: 'all 0.4s ease',
                }}>
                  {step === 1 ? (
                    <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  ) : (
                    <svg style={{ width: '22px', height: '22px', color: '#000' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  )}
                </div>
                <h1 style={{
                  fontSize: '1.6rem', fontWeight: 900, color: '#F0F4FF',
                  letterSpacing: '-0.8px', fontFamily: "'Syne', sans-serif", margin: 0,
                }}>
                  {step === 1 ? 'Create account' : 'Your stats'}
                </h1>
                <p style={{ color: 'rgba(180,200,240,0.4)', fontSize: '14px', marginTop: '6px' }}>
                  {step === 1 ? 'Set up your login credentials' : 'Help us personalize your journey'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-shake" style={{
                  marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px 14px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.35)',
                }}>
                  <svg style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                  <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 500 }}>{error}</p>
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Username */}
                  <div>
                    <label style={labelStyle}>Username</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                        </svg>
                      </div>
                      <input
                        id="signup-username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => update('username', e.target.value)}
                        placeholder="your_username"
                        autoComplete="username"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08), 0 0 20px rgba(124,58,237,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="min 6, max 12 chars"
                        autoComplete="new-password"
                        style={{ ...inputStyle, paddingRight: '44px' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(180,200,240,0.3)', padding: 0, transition: 'color 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(180,200,240,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,200,240,0.3)'}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {showPassword
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                          }
                        </svg>
                      </button>
                    </div>

                    {/* Strength meter */}
                    {formData.password && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={{
                              flex: 1, height: '3px', borderRadius: '99px',
                              background: score >= i ? s.color : 'rgba(255,255,255,0.08)',
                              transition: 'background 0.3s ease',
                              boxShadow: score >= i ? `0 0 6px ${s.color}60` : 'none',
                            }} />
                          ))}
                        </div>
                        <p style={{ fontSize: '10px', color: s.color, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>
                          {s.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        placeholder="repeat password"
                        autoComplete="new-password"
                        style={{
                          ...inputStyle,
                          borderColor: formData.confirmPassword && formData.confirmPassword !== formData.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.09)',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)'; }}
                        onBlur={e => {
                          const matched = formData.confirmPassword === formData.password;
                          e.target.style.borderColor = formData.confirmPassword ? (matched ? 'rgba(0,255,135,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.09)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <button
                    id="signup-step1-btn"
                    type="submit"
                    style={{
                      width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #FF0080 60%, #a855f7 100%)',
                      backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
                      color: '#fff', fontSize: '14px', fontWeight: 700,
                      cursor: 'pointer', letterSpacing: '0.03em',
                      boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
                      transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                      marginTop: '4px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.35)'; }}
                  >
                    Continue →
                  </button>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Row: Age */}
                  <div>
                    <label style={{ ...labelStyle, color: 'rgba(0,245,255,0.7)' }}>Age (years)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                        </svg>
                      </div>
                      <input
                        id="signup-age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => update('age', e.target.value)}
                        placeholder="e.g. 25"
                        min="10" max="120"
                        style={{ ...inputStyle, caretColor: '#00F5FF' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label style={{ ...labelStyle, color: 'rgba(0,255,135,0.7)' }}>Height (cm)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                      </div>
                      <input
                        id="signup-height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => update('height', e.target.value)}
                        placeholder="e.g. 175"
                        min="100" max="250"
                        style={{ ...inputStyle, caretColor: '#00FF87' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(0,255,135,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,255,135,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label style={{ ...labelStyle, color: 'rgba(255,184,0,0.75)' }}>Weight (kg)</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(180,200,240,0.3)', pointerEvents: 'none' }}>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L5.25 4.97z" />
                        </svg>
                      </div>
                      <input
                        id="signup-weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => update('weight', e.target.value)}
                        placeholder="e.g. 70"
                        min="20" max="300"
                        style={{ ...inputStyle, caretColor: '#FFB800' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(255,184,0,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,184,0,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); }}
                      style={{
                        flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(180,200,240,0.55)', fontSize: '14px', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#F0F4FF'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(180,200,240,0.55)'; }}
                    >← Back</button>
                    <button
                      id="signup-submit"
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                        background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00F5FF 0%, #00FF87 100%)',
                        color: loading ? 'rgba(255,255,255,0.3)' : '#000',
                        fontSize: '14px', fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 4px 24px rgba(0,255,135,0.35)',
                        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,255,135,0.5)'; }}}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 24px rgba(0,255,135,0.35)'; }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <svg style={{ width: '16px', height: '16px', animation: 'rotateGlow 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Creating...
                        </span>
                      ) : '🚀 Launch My Journey'}
                    </button>
                  </div>
                </form>
              )}

              {/* Divider */}
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ color: 'rgba(180,200,240,0.22)', fontSize: '10px', fontFamily: "'Space Mono', monospace" }}>HAVE AN ACCOUNT?</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px',
                  background: 'transparent', border: '1px solid rgba(124,58,237,0.18)',
                  color: 'rgba(180,200,240,0.6)', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#F0F4FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)'; e.currentTarget.style.color = 'rgba(180,200,240,0.6)'; }}
              >
                Sign in instead
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(180,200,240,0.15)', fontSize: '11px', marginTop: '20px', fontFamily: "'Space Mono', monospace" }}>
            By creating an account you agree to our{' '}
            <span style={{ color: 'rgba(124,58,237,0.4)', cursor: 'pointer' }}>Terms</span>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Branding ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #060316 0%, #060d1a 50%, #020408 100%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* Left edge accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.35) 30%, rgba(0,245,255,0.3) 70%, transparent)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7C3AED, #FF0080)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', fontFamily: "'Syne', sans-serif", boxShadow: '0 0 28px rgba(124,58,237,0.5)' }}>F</div>
          <span className="text-white font-black text-2xl tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>FITSTART</span>
        </div>

        <div className="relative z-10">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '100px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: '10px', fontWeight: 700, color: '#a78bfa',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace", marginBottom: '24px',
          }}>
            <span style={{ width: '5px', height: '5px', background: '#a78bfa', borderRadius: '50%', animation: 'ping-slow 2s infinite', display: 'inline-block' }} />
            Start Your Transformation
          </div>

          <h2 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', color: '#F0F4FF', marginBottom: '16px', fontFamily: "'Syne', sans-serif" }}>
            Your journey to a{' '}
            <span style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #00F5FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              better you
            </span>{' '}
            starts here.
          </h2>
          <p style={{ color: 'rgba(180,200,240,0.35)', fontSize: '15px', lineHeight: 1.65, maxWidth: '320px' }}>
            Personalized fitness, nutrition, and habit tracking designed to get you real results.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
            {[
              { icon: '🥗', text: 'AI-generated weekly meal plans', color: '#00FF87' },
              { icon: '🏋️', text: 'Tailored workout programs', color: '#7C3AED' },
              { icon: '🔥', text: 'Daily streak & habit tracker', color: '#FFB800' },
              { icon: '📊', text: 'BMI, weight & progress charts', color: '#FF0080' },
            ].map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: `${f.color}15`, border: `1px solid ${f.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(180,200,240,0.55)', fontSize: '14px', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10" style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6 }}>
            "Success is the sum of small efforts, repeated day in and day out."
          </p>
          <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: '11px', marginTop: '4px', fontWeight: 600, fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>— Robert Collier</p>
        </div>
      </div>

    </div>
  );
};

export default Signup;
