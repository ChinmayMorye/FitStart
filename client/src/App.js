import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DietPage from './pages/DietPage';
import WorkoutPage from './pages/WorkoutPage';
import StreakPage from './pages/StreakPage';

import { JourneyProvider, useJourney } from './context/JourneyContext';

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen() {
  const [progress, setProgress] = React.useState(0);
  const [bootLine, setBootLine] = React.useState(0);

  const BOOT_LINES = [
    'Initializing performance engine...',
    'Loading your fitness profile...',
    'Calibrating personal algorithms...',
    'Your journey begins now.',
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setBootLine(b => Math.min(b + 1, BOOT_LINES.length - 1));
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(progress / 25)]);

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: '#0A0A0F',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,60,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Subtle grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }} />

      {/* Central content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
        {/* Logo icon */}
        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '1px solid rgba(182,255,60,0.2)', animation: 'pingExpand 2s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: '1px solid rgba(0,229,255,0.15)', animation: 'pingExpand 2s 0.5s ease-out infinite' }} />
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0A0A0F', fontSize: '2rem', fontWeight: 900,
            boxShadow: '0 0 40px rgba(182,255,60,0.4)',
            animation: 'statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>F</div>
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 800,
          letterSpacing: '-2px',
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 3s ease infinite',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          margin: '0 0 8px',
        }}>FITSTART</h1>

        {/* Boot line */}
        <p style={{
          color: 'rgba(161,161,170,0.7)',
          fontSize: '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: "'Space Mono', monospace",
          minHeight: '18px',
        }}>{BOOT_LINES[bootLine]}</p>

        {/* Progress bar */}
        <div style={{ width: '200px', marginTop: '32px' }}>
          <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #B6FF3C, #00E5FF)', borderRadius: '2px', boxShadow: '0 0 8px rgba(182,255,60,0.5)', transition: 'width 0.05s linear' }} />
          </div>
          <p style={{ textAlign: 'right', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'rgba(107,107,118,1)', marginTop: '6px' }}>{progress}%</p>
        </div>
      </div>
    </div>
  );
}

// ── Landing Page Features ────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'NUTRITION',
    title: 'Smart Diet Plans',
    desc: 'AI-crafted meal plans with precise macros, alternatives, and weekly variety to hit your goals.',
    accentColor: '#B6FF3C',
    bgAlpha: 'rgba(182,255,60,0.05)',
    borderAlpha: 'rgba(182,255,60,0.2)',
    glowAlpha: 'rgba(182,255,60,0.12)',
    iconSvg: 'nutrition',
  },
  {
    label: 'TRAINING',
    title: 'Custom Workouts',
    desc: 'Tailored exercise routines for home or gym — from beginner-friendly to elite performance.',
    accentColor: '#00E5FF',
    bgAlpha: 'rgba(0,229,255,0.05)',
    borderAlpha: 'rgba(0,229,255,0.2)',
    glowAlpha: 'rgba(0,229,255,0.12)',
    iconSvg: 'dumbbell',
  },
  {
    label: 'CONSISTENCY',
    title: 'Streak Tracking',
    desc: 'Build unstoppable habits with daily streaks, journey milestones, and accountability tools.',
    accentColor: '#FF7A00',
    bgAlpha: 'rgba(255,122,0,0.05)',
    borderAlpha: 'rgba(255,122,0,0.2)',
    glowAlpha: 'rgba(255,122,0,0.12)',
    iconSvg: 'flame',
  },
  {
    label: 'ANALYTICS',
    title: 'Progress Insights',
    desc: 'Visual BMI tracking, body stat trends, and performance charts — all in one clean dashboard.',
    accentColor: '#B6FF3C',
    bgAlpha: 'rgba(182,255,60,0.04)',
    borderAlpha: 'rgba(182,255,60,0.18)',
    glowAlpha: 'rgba(182,255,60,0.1)',
    iconSvg: 'chart',
  },
];

// SVG icons (Lucide-style, inline) — no emoji as icons per UX guidelines
function FeatureIcon({ type, color }) {
  const s = { width: '22px', height: '22px', stroke: color, fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'nutrition') return (
    <svg style={s} viewBox="0 0 24 24"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" /></svg>
  );
  if (type === 'dumbbell') return (
    <svg style={s} viewBox="0 0 24 24"><path d="M6 5v14M18 5v14" /><rect x="3" y="7" width="6" height="10" rx="1" /><rect x="15" y="7" width="6" height="10" rx="1" /><line x1="6" y1="12" x2="18" y2="12" /></svg>
  );
  if (type === 'flame') return (
    <svg style={s} viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
  );
  if (type === 'chart') return (
    <svg style={s} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
  );
  return null;
}

// ── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = React.useState(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); }); },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      color: '#FFFFFF',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Background: ambient orbs + subtle grid ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="animate-float" style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,60,0.06) 0%, transparent 65%)' }} />
        <div className="animate-float-2" style={{ position: 'absolute', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)' }} />
        <div className="animate-float" style={{ position: 'absolute', bottom: '-10%', left: '30%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,0,0.04) 0%, transparent 65%)', animationDelay: '3s' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)' }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 clamp(24px, 5vw, 64px)',
        height: '64px',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #26262F',
      }}>
        {/* Accent line bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(182,255,60,0.4) 40%, rgba(0,229,255,0.4) 60%, transparent)', backgroundSize: '200% 100%', animation: 'borderSpin 5s linear infinite' }} />

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label="FitStart home"
        >
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#0A0A0F', boxShadow: '0 0 20px rgba(182,255,60,0.35)' }}>F</div>
          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>FitStart</span>
        </button>

        {/* Nav actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{ padding: '9px 20px', minHeight: '40px', borderRadius: '100px', background: 'transparent', border: '1px solid #32323E', color: '#A1A1AA', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#32323E'; e.currentTarget.style.color = '#A1A1AA'; }}
          >Sign Up</button>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '9px 20px', minHeight: '40px', borderRadius: '100px', background: 'linear-gradient(135deg, #B6FF3C, #00E5FF)', border: 'none', color: '#0A0A0F', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 4px 16px rgba(182,255,60,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(182,255,60,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(182,255,60,0.35)'; }}
          >Login</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        aria-label="Hero"
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: 'clamp(100px, 15vh, 140px) clamp(24px, 5vw, 80px) clamp(64px, 10vh, 96px)',
        }}
      >
        {/* Eyebrow badge */}
        <div
          className="animate-fade-in"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            background: 'rgba(182,255,60,0.07)',
            border: '1px solid rgba(182,255,60,0.25)',
            marginBottom: '32px',
            fontSize: '11px', fontWeight: 700, color: '#B6FF3C',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B6FF3C', display: 'inline-block', boxShadow: '0 0 8px rgba(182,255,60,0.8)' }} />
          Your Ultimate Fitness Companion
        </div>

        {/* Headline — 3-second clarity test */}
        <h1
          className="animate-fade-in delay-100"
          style={{
            fontSize: 'clamp(52px, 10vw, 96px)',
            fontWeight: 800,
            letterSpacing: '-3px',
            lineHeight: 1.0,
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          Train Smarter.{' '}
          <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Hit Goals.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-in delay-200"
          style={{
            color: '#A1A1AA',
            fontSize: 'clamp(16px, 2vw, 20px)',
            maxWidth: '560px',
            lineHeight: 1.65,
            marginBottom: '40px',
          }}
        >
          Personalized diet plans, custom workouts, and streak tracking — all in one place.
          <strong style={{ color: '#FFFFFF', fontWeight: 600 }}> Built for real athletes.</strong>
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-300" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}>
          <button
            id="start-journey-btn"
            onClick={() => navigate('/signup')}
            style={{
              padding: '16px 36px', minHeight: '52px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
              backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
              border: 'none', color: '#0A0A0F',
              fontSize: '16px', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(182,255,60,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(182,255,60,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(182,255,60,0.4)'; }}
          >
            Start Your Journey →
          </button>
          <button
            id="signin-btn"
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 32px', minHeight: '52px',
              borderRadius: '100px',
              background: 'transparent',
              border: '1px solid #32323E',
              color: '#A1A1AA',
              fontSize: '16px', fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,229,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#32323E'; e.currentTarget.style.color = '#A1A1AA'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Sign In
          </button>
        </div>

        {/* Social proof stats */}
        <div
          className="animate-fade-in delay-400"
          style={{
            display: 'flex', alignItems: 'center',
            gap: '0',
            padding: '16px 24px', borderRadius: '100px',
            background: 'rgba(20,20,27,0.8)',
            border: '1px solid #26262F',
            backdropFilter: 'blur(16px)',
          }}
        >
          {[
            { val: '10K+', label: 'Athletes', color: '#B6FF3C' },
            { val: '500+', label: 'Workouts', color: '#00E5FF' },
            { val: '98%',  label: 'Success Rate', color: '#FF7A00' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', height: '28px', background: '#26262F', margin: '0 8px' }} />}
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: "'Space Mono', monospace" }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#6B6B76', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', fontWeight: 500 }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-in delay-500" style={{ position: 'absolute', bottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#6B6B76', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace" }}>
          <span>Scroll</span>
          <div style={{ width: '20px', height: '34px', borderRadius: '10px', border: '1px solid #32323E', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4px' }}>
            <div style={{ width: '2px', height: '8px', borderRadius: '2px', background: '#B6FF3C', animation: 'float2 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section
        aria-label="Features"
        style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(64px, 10vw, 96px) clamp(24px, 5vw, 80px)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', fontSize: '11px', fontWeight: 700, color: '#00E5FF', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginBottom: '20px' }}>Platform Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: '16px' }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #B6FF3C, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>transform</span>
            </h2>
            <p style={{ color: '#A1A1AA', fontSize: '17px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
              A complete ecosystem designed to track, train, and transform — intelligently.
            </p>
          </div>

          {/* Feature cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: 'clamp(64px, 10vw, 96px)' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="reveal-on-scroll card-holo"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background: hoveredFeature === i ? f.bgAlpha : '#14141B',
                  border: `1px solid ${hoveredFeature === i ? f.borderAlpha : '#26262F'}`,
                  transition: 'all 0.3s ease',
                  transform: hoveredFeature === i ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === i ? `0 20px 48px ${f.glowAlpha}` : '0 2px 16px rgba(0,0,0,0.5)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Label chip */}
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '100px', background: `${f.accentColor}12`, border: `1px solid ${f.accentColor}30`, fontSize: '10px', fontWeight: 700, color: f.accentColor, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace", marginBottom: '20px' }}>{f.label}</div>

                {/* Icon box */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${f.accentColor}10`, border: `1px solid ${f.accentColor}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  transform: hoveredFeature === i ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: hoveredFeature === i ? `0 0 20px ${f.glowAlpha}` : 'none',
                }}>
                  <FeatureIcon type={f.iconSvg} color={f.accentColor} />
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px', color: '#FFFFFF', lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#6B6B76', lineHeight: 1.65 }}>{f.desc}</p>

                {/* Bottom accent line on hover */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${f.accentColor}, transparent)`, opacity: hoveredFeature === i ? 1 : 0, transition: 'opacity 0.3s' }} />
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div
            className="reveal-on-scroll"
            style={{
              borderRadius: '20px',
              padding: 'clamp(48px, 8vw, 80px) clamp(32px, 5vw, 80px)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: '#14141B',
              border: '1px solid #26262F',
            }}
          >
            {/* Top accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #B6FF3C 40%, #00E5FF 60%, transparent)', backgroundSize: '200% 100%', animation: 'borderSpin 4s linear infinite' }} />
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(182,255,60,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #B6FF3C, #00E5FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(182,255,60,0.35)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2, marginBottom: '16px', color: '#FFFFFF' }}>
                Your transformation{' '}
                <span style={{ background: 'linear-gradient(135deg, #B6FF3C, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>starts now</span>
              </h2>
              <p style={{ color: '#6B6B76', marginBottom: '40px', fontSize: '16px', lineHeight: 1.65, maxWidth: '400px', margin: '0 auto 40px' }}>
                Free to start. No excuses. Just results.
              </p>
              <button
                id="bottom-cta-btn"
                onClick={() => navigate('/signup')}
                style={{
                  padding: '16px 48px', minHeight: '52px', borderRadius: '100px',
                  background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
                  backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
                  border: 'none', color: '#0A0A0F', fontSize: '16px', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 8px 32px rgba(182,255,60,0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(182,255,60,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(182,255,60,0.4)'; }}
              >
                Get Started — It's Free
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', color: '#6B6B76', fontSize: '13px', marginTop: '32px', fontFamily: "'Space Mono', monospace" }}>
            © 2025 FitStart · Built for champions
          </p>
        </div>
      </section>
    </div>
  );
}

// ── Restore per-day completion flags from journeyData ──────────────────────
// Writes fitstart_day_done_w{W}_d{D} = '1' for every completed journey day.
// DietPage's loadDayChecks() and WorkoutPage's loadMuscles() read this flag
// and synthesize a fully-checked state, solving the post-logout blank state.
const DAY_NAMES_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function restoreCompletedDayFlags(journeyData, preferences) {
  if (!journeyData) return;
  const completedDays = journeyData.completedDays || [];
  const startDateRaw  = journeyData.startDate;
  if (!completedDays.length || !startDateRaw) return;

  const sd = new Date(startDateRaw);
  // Convert JS getDay() (0=Sun) to 0=Mon system
  const startDow = sd.getDay() === 0 ? 6 : sd.getDay() - 1;

  const dietType   = preferences?.dietType || null;
  const restDay    = preferences?.restDay || 'Sunday';

  completedDays.forEach(dayN => {
    const week = Math.floor((dayN - 1) / 7);
    const dow  = (startDow + dayN - 1) % 7; // 0=Mon
    // Primary flag read by DietPage & WorkoutPage
    localStorage.setItem(`fitstart_day_done_w${week}_d${dow}`, '1');
    // Cheat day flag (DietPage: Sunday = day index 6 in 0=Mon system)
    if (dietType && dow === 6) {
      localStorage.setItem(`fitstart_cheat_${dietType}_w${week}_d6`, '1');
    }
    // Rest day done flag (WorkoutPage: fitstart_rest_done_w{W}_{dayname})
    const dayName = DAY_NAMES_EN[dow];
    if (dayName === restDay) {
      localStorage.setItem(`fitstart_rest_done_w${week}_${dayName.toLowerCase()}`, '1');
    }
  });
}

// ── Restore individual checkbox states from server ────────────────────────────
// preferences.dietChecks    = { "veg_w0_d0": { "m0_i0": true, ... }, ... }
// preferences.workoutChecks = { "w0_monday": [true, false, ...], ... }
// These get written back to their localStorage keys so DietPage/WorkoutPage
// show the exact same checked items the user had before logging out.
function restoreDailyChecks(preferences) {
  if (!preferences) return;
  try {
    const dietChecks = preferences.dietChecks || {};
    Object.entries(dietChecks).forEach(([key, checks]) => {
      if (checks && Object.keys(checks).length > 0) {
        localStorage.setItem(`fitstart_diet_checks_${key}`, JSON.stringify(checks));
      }
    });
  } catch (_) {}
  try {
    const workoutChecks = preferences.workoutChecks || {};
    Object.entries(workoutChecks).forEach(([key, checks]) => {
      if (Array.isArray(checks) && checks.some(Boolean)) {
        localStorage.setItem(`fitstart_muscles_${key}`, JSON.stringify(checks));
      }
    });
  } catch (_) {}
}


// ── Clear all FitStart localStorage keys (called on logout / new login) ───────
// Pass keepToken to preserve the freshly-received token across user switches.
function clearUserLocalData(keepToken) {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('fitstart_')) keysToRemove.push(k);
  }
  keysToRemove.forEach(k => {
    if (k === 'fitstart_token' && keepToken) return; // keep the new session token
    localStorage.removeItem(k);
  });
  if (keepToken) localStorage.setItem('fitstart_token', keepToken);
}

// ── Main App ─────────────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || '';

// Inner component that can access JourneyContext
function AppRoutes() {
  const { syncFromProfile } = useJourney();

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // On mount: check for saved session, then refresh from DB.
  // The splash timer and the data fetch are DECOUPLED:
  // - Splash hides after 1200ms (UX polish).
  // - DB fetch starts IMMEDIATELY so fresh data arrives as fast as possible.
  useEffect(() => {
    // Start data fetch right away — don't wait for splash
    const storedUser = localStorage.getItem('fitstart_user');
    const token      = localStorage.getItem('fitstart_token');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserInfo(parsed); // immediately from cache
        syncFromProfile(parsed.journeyData);

        // Fetch fresh data from DB in background
        (async () => {
          try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              const dbUser = data.user || {};
              const freshUser = {
                ...parsed,
                journeyData:    dbUser.journeyData,
                preferences:    dbUser.preferences,
                username:       dbUser.username       ?? parsed.username,
                profilePicture: dbUser.profilePicture ?? parsed.profilePicture,
                height:         dbUser.height         ?? parsed.height,
                weight:         dbUser.weight         ?? parsed.weight,
                age:            dbUser.age            ?? parsed.age,
              };
              setUserInfo(freshUser);
              localStorage.setItem('fitstart_user', JSON.stringify(freshUser));
              syncFromProfile(dbUser.journeyData);

              // Sync individual preference keys
              const prefs = dbUser.preferences || {};
              if (prefs.dietType)      localStorage.setItem('fitstart_diet_type',    prefs.dietType);
              else                     localStorage.removeItem('fitstart_diet_type');
              if (prefs.workoutDays)   localStorage.setItem('fitstart_workout_days', String(prefs.workoutDays));
              else                     localStorage.removeItem('fitstart_workout_days');
              if (prefs.workoutPlanId) localStorage.setItem('fitstart_workout_plan', prefs.workoutPlanId);
              else                     localStorage.removeItem('fitstart_workout_plan');
              localStorage.setItem('fitstart_rest_day', prefs.restDay || 'Sunday');
              // "Both" diet day allocation
              if (prefs.dietType === 'both') {
                if (prefs.bothVegDays?.length)    localStorage.setItem('fitstart_both_veg_days',    JSON.stringify(prefs.bothVegDays));
                if (prefs.bothNonVegDays?.length) localStorage.setItem('fitstart_both_nonveg_days', JSON.stringify(prefs.bothNonVegDays));
              } else {
                localStorage.removeItem('fitstart_both_veg_days');
                localStorage.removeItem('fitstart_both_nonveg_days');
              }
              if (dbUser.journeyData?.totalDays)
                localStorage.setItem('fitstart_streak', JSON.stringify(dbUser.journeyData));
              restoreCompletedDayFlags(dbUser.journeyData, dbUser.preferences);
              restoreDailyChecks(dbUser.preferences);
            }
          } catch (_) {}
        })();
      } catch (_) {}
    }
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // handleLoginSuccess accepts { user, token } so it can preserve the token
  // across clearUserLocalData(). Login.js calls onLoginSuccess({ user, token }).
  const handleLoginSuccess = useCallback(({ user, token } = {}) => {
    // Wipe the previous user's local data, but keep the new token we just received
    clearUserLocalData(token);
    setIsLoggedIn(true);
    if (user) {
      setUserInfo(user);

      // ── Write full user object so all pages can read preferences ──────────
      localStorage.setItem('fitstart_user', JSON.stringify(user));

      // ── Sync individual preference keys (used by DietPage/WorkoutPage) ────
      const prefs = user.preferences || {};
      if (prefs.dietType)      localStorage.setItem('fitstart_diet_type',    prefs.dietType);
      else                     localStorage.removeItem('fitstart_diet_type');
      if (prefs.workoutDays)   localStorage.setItem('fitstart_workout_days', String(prefs.workoutDays));
      else                     localStorage.removeItem('fitstart_workout_days');
      if (prefs.workoutPlanId) localStorage.setItem('fitstart_workout_plan', prefs.workoutPlanId);
      else                     localStorage.removeItem('fitstart_workout_plan');
      localStorage.setItem('fitstart_rest_day', prefs.restDay || 'Sunday');
      // "Both" diet day allocation — restore from server so DietPage skips re-setup
      if (prefs.dietType === 'both') {
        if (prefs.bothVegDays?.length)    localStorage.setItem('fitstart_both_veg_days',    JSON.stringify(prefs.bothVegDays));
        if (prefs.bothNonVegDays?.length) localStorage.setItem('fitstart_both_nonveg_days', JSON.stringify(prefs.bothNonVegDays));
      } else {
        localStorage.removeItem('fitstart_both_veg_days');
        localStorage.removeItem('fitstart_both_nonveg_days');
      }

      // ── Sync journey cache ────────────────────────────────────────────────
      if (user.journeyData?.totalDays)
        localStorage.setItem('fitstart_streak', JSON.stringify(user.journeyData));
      else
        localStorage.removeItem('fitstart_streak');

      // ── Restore per-day done flags → DietPage & WorkoutPage show ✓ DONE ────
      // Writes fitstart_day_done_w{W}_d{D} for every completed journey day so
      // loadDayChecks() and loadMuscles() can synthesize the checked state.
      restoreCompletedDayFlags(user.journeyData, user.preferences);
      // ── Restore individual checkbox states from server ────────────────────
      restoreDailyChecks(user.preferences);

      // ── Sync journey context (React state) ───────────────────────────────
      syncFromProfile(user.journeyData);
    }
  }, [syncFromProfile]);

  const handleLogout = useCallback(() => {
    clearUserLocalData();
    setIsLoggedIn(false);
    setUserInfo(null);
    // Reset JourneyContext so stale state doesn't bleed into the next login session
    syncFromProfile({ completedDays: [], currentStreak: 0, totalDays: 0, startDate: null, workoutPlace: [] });
  }, [syncFromProfile]);

  const hasInfo = !!(userInfo?.weight && userInfo?.height && userInfo?.age);

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>
      {/* Landing */}
      <Route
        path="/"
        element={
          isLoggedIn
            ? <Navigate to={hasInfo ? '/dashboard' : '/onboarding'} replace />
            : <LandingPage />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to={hasInfo ? '/dashboard' : '/onboarding'} replace />
            : <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />

      {/* Signup */}
      <Route
        path="/signup"
        element={
          isLoggedIn
            ? <Navigate to={hasInfo ? '/dashboard' : '/onboarding'} replace />
            : <SignupPage onSignupSuccess={handleLoginSuccess} />
        }
      />

      {/* Onboarding — collect height, age, weight */}
      <Route
        path="/onboarding"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : hasInfo
            ? <Navigate to="/dashboard" replace />
            : <Onboarding onComplete={(info) => setUserInfo(info)} />
        }
      />

      {/* Dashboard — choose Diet or Workout */}
      <Route
        path="/dashboard"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : !hasInfo
            ? <Navigate to="/onboarding" replace />
            : <Dashboard userInfo={userInfo} onLogout={handleLogout} />
        }
      />

      {/* Diet Page */}
      <Route
        path="/diet"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : <DietPage userInfo={userInfo} />
        }
      />

      {/* Workout Page */}
      <Route
        path="/workout"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : <WorkoutPage userInfo={userInfo} />
        }
      />

      {/* Streak / Journey Road */}
      <Route
        path="/streak"
        element={
          !isLoggedIn
            ? <Navigate to="/login" replace />
            : <StreakPage />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />


    </Routes>
  );
}

function App() {
  return (
    <Router>
      <JourneyProvider>
        <AppRoutes />
      </JourneyProvider>
    </Router>
  );
}

export default App;