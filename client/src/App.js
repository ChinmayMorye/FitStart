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

// ── Splash Screen — Cinematic Boot Sequence ─────────────────────────────────
function SplashScreen() {
  const [progress, setProgress] = React.useState(0);
  const [bootLine, setBootLine] = React.useState(0);

  const BOOT_LINES = [
    'Initializing neural systems...',
    'Loading performance matrices...',
    'Calibrating fitness algorithms...',
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
  }, [Math.floor(progress / 25)]); // intentional computed dependency

  return (
    <div
      style={{
        height: '100vh', width: '100vw',
        background: '#020408',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Cyber grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
      }} />

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-150px', left: '-150px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,255,0.12) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-150px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        animation: 'float2 12s ease-in-out infinite',
      }} />

      {/* Scanline effect */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.01) 2px, rgba(0,245,255,0.01) 4px)',
      }} />

      {/* Central content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 3 }}>
        {/* Logo icon with pulsing ring */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 28px' }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute', inset: '-12px',
            borderRadius: '50%',
            border: '1px solid rgba(0,245,255,0.2)',
            animation: 'pingExpand 2s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '-6px',
            borderRadius: '50%',
            border: '1px solid rgba(0,245,255,0.15)',
            animation: 'pingExpand 2s 0.5s ease-out infinite',
          }} />
          {/* Main logo box */}
          <div
            style={{
              width: '100px', height: '100px', borderRadius: '26px',
              background: 'linear-gradient(135deg, #00F5FF, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: 900,
              boxShadow: '0 0 50px rgba(0,245,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'statPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
              position: 'relative',
            }}
          >
            F
          </div>
        </div>

        {/* Logo wordmark */}
        <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-3px',
            fontFamily: "'Syne', 'Inter', sans-serif",
            background: 'linear-gradient(135deg, #00F5FF, #7C3AED, #FF0080)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 2s ease infinite, fadeIn 0.8s 0.2s both',
            marginBottom: '8px',
          }}
        >
          FITSTART
        </h1>

        {/* Boot text */}
        <p style={{
          color: 'rgba(0,245,255,0.5)',
          fontSize: '12px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          fontFamily: "'Space Mono', monospace",
          marginTop: '8px',
          animation: 'fadeIn 0.6s 0.4s both',
          minHeight: '18px',
        }}>
          {BOOT_LINES[bootLine]}
        </p>

        {/* Progress bar */}
        <div style={{
          width: '220px', margin: '28px auto 0',
          animation: 'fadeIn 0.6s 0.6s both',
        }}>
          <div style={{
            width: '100%', height: '2px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00F5FF, #7C3AED)',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(0,245,255,0.6)',
              transition: 'width 0.05s linear',
            }} />
          </div>
          <p style={{
            textAlign: 'right',
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: 'rgba(0,245,255,0.4)',
            marginTop: '6px',
            letterSpacing: '0.1em',
          }}>{progress}%</p>
        </div>
      </div>
    </div>
  );
}

// ── Landing Page Features ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🥗',
    title: 'Smart Diet Plans',
    desc: 'AI-crafted meal plans with macros, alternatives & weekly variety.',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.07)',
    border: 'rgba(0,255,135,0.2)',
    glow: 'rgba(0,255,135,0.15)',
    tag: 'NUTRITION',
  },
  {
    icon: '🏋️',
    title: 'Custom Workouts',
    desc: 'Tailored routines for home or gym, beginner-friendly to elite.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.07)',
    border: 'rgba(124,58,237,0.2)',
    glow: 'rgba(124,58,237,0.15)',
    tag: 'TRAINING',
  },
  {
    icon: '🔥',
    title: 'Streak Tracking',
    desc: 'Build unstoppable habits with daily streaks & journey milestones.',
    color: '#FFB800',
    bg: 'rgba(255,184,0,0.06)',
    border: 'rgba(255,184,0,0.2)',
    glow: 'rgba(255,184,0,0.12)',
    tag: 'HABITS',
  },
  {
    icon: '📊',
    title: 'Progress Insights',
    desc: 'Visual progress charts, BMI tracking, and body stats at a glance.',
    color: '#FF0080',
    bg: 'rgba(255,0,128,0.06)',
    border: 'rgba(255,0,128,0.2)',
    glow: 'rgba(255,0,128,0.12)',
    tag: 'ANALYTICS',
  },
];

// ── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = React.useState(null);

  // Scroll-triggered reveal for features
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    const els = document.querySelectorAll('.reveal-on-scroll');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020408',
        color: '#F0F4FF',
        overflowX: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Aurora Background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {/* Orb 1 */}
        <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,255,0.09) 0%, transparent 65%)', animation: 'float 12s ease-in-out infinite' }} />
        {/* Orb 2 */}
        <div style={{ position: 'absolute', top: '25%', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', animation: 'float2 14s ease-in-out infinite' }} />
        {/* Orb 3 */}
        <div style={{ position: 'absolute', bottom: '-150px', left: '25%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,0,128,0.07) 0%, transparent 65%)', animation: 'float 11s ease-in-out infinite' }} />
        {/* Cyber grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 2.5rem', height: '68px',
          background: 'rgba(2,4,8,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Animated bottom accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.4) 30%, rgba(124,58,237,0.4) 70%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'borderSpin 4s linear infinite',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div className="logo-box-glow" style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F5FF, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '18px',
            boxShadow: '0 0 24px rgba(0,245,255,0.45)',
            fontFamily: "'Syne', sans-serif",
          }}>F</div>
          <span style={{
            fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-1px',
            fontFamily: "'Syne', sans-serif",
            background: 'linear-gradient(90deg, #00F5FF, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>FITSTART</span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '8px 22px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.25s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 22px', borderRadius: '100px',
              background: 'linear-gradient(135deg, #00F5FF, #7C3AED)',
              border: 'none', color: '#000',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: '0 4px 20px rgba(0,245,255,0.35)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,245,255,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,245,255,0.35)'; }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '100px 1.5rem 80px',
        }}
      >
        {/* Eyebrow badge */}
        <div
          className="animate-fade-in"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px', borderRadius: '100px',
            background: 'rgba(0,245,255,0.06)',
            border: '1px solid rgba(0,245,255,0.18)',
            marginBottom: '36px',
            fontSize: '11px', fontWeight: 700, color: '#00F5FF',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace",
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ position: 'relative', width: '8px', height: '8px' }}>
            <span style={{ position: 'absolute', inset: 0, background: '#00F5FF', borderRadius: '50%', animation: 'ping-slow 2s infinite' }} />
            <span style={{ position: 'absolute', inset: 0, background: '#00F5FF', borderRadius: '50%' }} />
          </div>
          Your Ultimate Fitness Companion
        </div>

        {/* Main headline */}
        <h1
          className="animate-fade-in delay-100"
          style={{
            fontSize: 'clamp(4.5rem, 12vw, 11rem)',
            fontWeight: 900,
            letterSpacing: '-6px',
            lineHeight: 0.9,
            marginBottom: '1.5rem',
            fontFamily: "'Syne', sans-serif",
          }}
        >
          FIT
          <span
            style={{
              background: 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 40%, #FF0080 80%, #00FF87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 4s ease infinite',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 40px rgba(0,245,255,0.25))',
            }}
          >
            START
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="animate-fade-in delay-200"
          style={{
            color: 'rgba(180,200,240,0.45)',
            fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
            maxWidth: '520px',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}
        >
          Push your limits. Track your gains.{' '}
          <span style={{ color: 'rgba(240,244,255,0.8)', fontWeight: 600 }}>Build the body you deserve.</span>
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in delay-300" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <button
            id="start-journey-btn"
            onClick={() => navigate('/signup')}
            style={{
              padding: '17px 40px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 50%, #FF0080 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite',
              border: 'none', color: '#fff',
              fontSize: '1.05rem', fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 40px rgba(0,245,255,0.4), 0 0 80px rgba(0,245,255,0.08)',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
              letterSpacing: '0.02em',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,245,255,0.5), 0 0 100px rgba(0,245,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,245,255,0.4), 0 0 80px rgba(0,245,255,0.08)'; }}
          >
            ⚡ Start Your Journey →
          </button>
          <button
            id="signin-btn"
            onClick={() => navigate('/login')}
            style={{
              padding: '17px 34px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,245,255,0.2)',
              color: 'rgba(240,244,255,0.75)',
              fontSize: '1.05rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.45)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'; e.currentTarget.style.color = 'rgba(240,244,255,0.75)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Sign In
          </button>
        </div>

        {/* Stat pills row */}
        <div
          className="animate-fade-in delay-400"
          style={{
            display: 'flex', alignItems: 'center', gap: '0',
            padding: '14px 28px', borderRadius: '100px',
            background: 'rgba(6,13,26,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {[
            { val: '10K+', label: 'Athletes', color: '#00F5FF' },
            { val: '500+', label: 'Workouts', color: '#00FF87' },
            { val: '98%', label: 'Satisfaction', color: '#7C3AED' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />}
              <div style={{ textAlign: 'center', padding: '0 18px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color, fontFamily: "'Space Mono', monospace", lineHeight: 1.2, textShadow: `0 0 16px ${s.color}60` }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'rgba(180,200,240,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className="animate-fade-in delay-500"
          style={{
            position: 'absolute', bottom: '28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            color: 'rgba(255,255,255,0.18)', fontSize: '9px', letterSpacing: '0.25em',
            textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
          }}
        >
          <span>Scroll</span>
          <div style={{
            width: '22px', height: '38px', borderRadius: '11px',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '5px',
          }}>
            <div style={{
              width: '3px', height: '9px', borderRadius: '3px',
              background: 'rgba(0,245,255,0.5)',
              animation: 'float2 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          padding: '6rem 1.5rem 8rem',
          maxWidth: '1100px', margin: '0 auto',
        }}
      >
        {/* Section header */}
        <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '100px',
            background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.12)',
            fontSize: '10px', fontWeight: 700, color: '#00F5FF',
            letterSpacing: '0.22em', textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '20px',
          }}>
            PLATFORM FEATURES
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)',
            fontWeight: 900, letterSpacing: '-2.5px',
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1.05,
          }}>
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #00FF87, #00F5FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              transform
            </span>
          </h2>
          <p style={{ color: 'rgba(180,200,240,0.38)', fontSize: '1.05rem', marginTop: '14px', maxWidth: '460px', margin: '14px auto 0', lineHeight: 1.65 }}>
            A complete ecosystem designed to track, train, and transform — intelligently.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '6rem' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="reveal-on-scroll card-holo"
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                padding: '2rem',
                borderRadius: '20px',
                background: hoveredFeature === i ? f.bg : 'rgba(6,13,26,0.65)',
                border: `1px solid ${hoveredFeature === i ? f.border : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hoveredFeature === i ? 'translateY(-8px) scale(1.01)' : 'translateY(0)',
                boxShadow: hoveredFeature === i ? `0 24px 60px ${f.glow}, 0 0 40px ${f.glow}` : '0 4px 24px rgba(0,0,0,0.3)',
                cursor: 'default',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden',
                transitionDelay: `${i * 0.04}s`,
              }}
            >
              {/* Tag chip */}
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: '100px',
                background: `${f.color}12`, border: `1px solid ${f.color}28`,
                fontSize: '9px', fontWeight: 700,
                color: f.color, letterSpacing: '0.15em',
                fontFamily: "'Space Mono', monospace", marginBottom: '18px',
              }}>{f.tag}</div>

              {/* Icon */}
              <div style={{
                fontSize: '2rem', marginBottom: '16px',
                width: '56px', height: '56px', borderRadius: '16px',
                background: f.bg, border: `1px solid ${f.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s',
                transform: hoveredFeature === i ? 'scale(1.12) rotate(-6deg)' : 'scale(1)',
                boxShadow: hoveredFeature === i ? `0 0 28px ${f.glow}` : 'none',
              }}>{f.icon}</div>

              <h3 style={{
                fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px',
                color: hoveredFeature === i ? '#F0F4FF' : 'rgba(240,244,255,0.88)',
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'color 0.3s',
              }}>{f.title}</h3>
              <p style={{ fontSize: '13.5px', color: 'rgba(180,200,240,0.42)', lineHeight: 1.65 }}>{f.desc}</p>

              {/* Bottom glow line */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                opacity: hoveredFeature === i ? 1 : 0, transition: 'opacity 0.35s',
              }} />
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div
          className="reveal-on-scroll"
          style={{
            borderRadius: '28px',
            padding: '4.5rem 2.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(6,13,26,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Glow layers */}
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '250px', background: 'radial-gradient(ellipse, rgba(0,245,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '20%', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Animated top border */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #00F5FF, #7C3AED, #FF0080, transparent)',
            backgroundSize: '200% 100%', animation: 'borderSpin 3s linear infinite',
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{
              fontSize: '4rem', marginBottom: '20px',
              filter: 'drop-shadow(0 0 20px rgba(255,184,0,0.5))',
              animation: 'floatSlow 4s ease-in-out infinite',
              display: 'inline-block',
            }}>🏆</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 900, marginBottom: '14px',
              letterSpacing: '-2px', fontFamily: "'Syne', sans-serif", lineHeight: 1.08,
            }}>
              Your transformation{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00F5FF, #FF0080)',
                backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>starts now</span>
            </h2>
            <p style={{ color: 'rgba(180,200,240,0.4)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.65 }}>
              Free to start. No excuses. Just results.
            </p>
            <button
              id="bottom-cta-btn"
              onClick={() => navigate('/signup')}
              style={{
                padding: '17px 48px', borderRadius: '100px',
                background: 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 50%, #FF0080 100%)',
                backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite',
                border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 12px 40px rgba(0,245,255,0.4)',
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,245,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,245,255,0.4)'; }}
            >
              Get Started — It's Free ⚡
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '13px', marginTop: '2rem' }}>
          © 2025 FitStart · Built for champions ✦
        </p>
      </div>
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
        } catch (_) {}
      }
      setShowSplash(false);
    }, 1200);
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