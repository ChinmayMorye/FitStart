// ── AppreciationModal.js ──────────────────────────────────────────────────────
// High-end celebration modal shown after completing a journey day or week.
// Features:
//   • Dark glassmorphism card with neon-cyan / electric-blue glow
//   • Pulsing shimmer ring animation
//   • Animated 5-second countdown bar (neon cyan depletion)
//   • Auto-dismisses after 5 seconds; manual ✕ close always available
//   • Two variants: 'daily'  → motivating day-complete message
//                   'weekly' → high-energy week-complete message

import React, { useEffect, useState, useRef } from 'react';

// ── Curated message banks ─────────────────────────────────────────────────────
const DAILY_MESSAGES = [
  { headline: "Crushed It! 💪", body: "You're becoming a force of nature. Keep that fire burning." },
  { headline: "Another One Down! ⚡", body: "Every rep, every meal, every day — you're wiring a new version of yourself." },
  { headline: "That's What It Takes! 🔥", body: "Most quit before it gets hard. You're not most people." },
  { headline: "Locked In. ✅", body: "The greats don't skip. Neither do you. You're building something real." },
  { headline: "Day Complete! 🎯", body: "Discipline is the bridge between goals and accomplishment. You crossed it today." },
  { headline: "Unstoppable. 🚀", body: "Your future self is watching you right now — and smiling." },
  { headline: "Forward Only. ⬆️", body: "Progress is progress, no matter the pace. One more day in the books." },
  { headline: "The Grind Is Real. 🏆", body: "You showed up. That's already more than most. Now rest and go again." },
];

const WEEKLY_MESSAGES = [
  "The foundation is built. Keep that momentum blazing! ⚡",
  "Seven days of discipline. That's not luck — that's character. 🏆",
  "A full week conquered. Your body is changing. Your mind is hardening. 💎",
  "One more week in the books. The compound effect is working for you. 📈",
  "You didn't just survive the week — you owned it. Warrior mentality. 🔥",
  "Week complete! Rest well. Champions are built in the recovery too. 💤",
  "Every week you stay consistent, you leave behind a weaker version of yourself. 🚀",
  "Another week down. The gap between you and yesterday's self widens. Keep going. ⚡",
];

// ── Shimmer ring particles ─────────────────────────────────────────────────────
function ShimmerRing() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '28px' }}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: i % 2 === 0 ? '#00f2ff' : '#4466ff',
            boxShadow: i % 2 === 0 ? '0 0 8px #00f2ff' : '0 0 8px #4466ff',
            top: '50%',
            left: '50%',
            animation: `orbitParticle${i} 3s linear infinite`,
            animationDelay: `${i * 0.375}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AppreciationModal({
  type,         // 'daily' | 'weekly'
  dayNumber,    // 1-based journey day number
  weekNumber,   // 1-based week number (for weekly variant)
  onClose,
}) {
  const DURATION_MS = 5000;
  const [progress, setProgress] = useState(100); // 100 → 0 over 5s
  const startRef = useRef(Date.now());
  const rafRef   = useRef(null);

  // ── Animate progress bar ───────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onClose && onClose();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pick message ───────────────────────────────────────────────────────────
  const isWeekly   = type === 'weekly';
  const msgIdx = isWeekly
    ? ((weekNumber - 1) % WEEKLY_MESSAGES.length)
    : ((dayNumber - 1) % DAILY_MESSAGES.length);
  const dailyMsg   = DAILY_MESSAGES[msgIdx];
  const weeklyBody = WEEKLY_MESSAGES[msgIdx];

  const weekLabel = weekNumber != null ? `Week ${weekNumber}` : 'Week';

  // ── Inline style keyframe injection ───────────────────────────────────────
  const styleTag = `
    @keyframes appreciationPop {
      0%   { opacity: 0; transform: scale(0.85) translateY(24px); }
      70%  { opacity: 1; transform: scale(1.03) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 40px rgba(0,242,255,0.18), 0 0 80px rgba(0,100,255,0.12); }
      50%       { box-shadow: 0 0 60px rgba(0,242,255,0.35), 0 0 120px rgba(0,100,255,0.22); }
    }
    @keyframes neonTextPulse {
      0%, 100% { text-shadow: 0 0 18px rgba(0,242,255,0.5); }
      50%       { text-shadow: 0 0 36px rgba(0,242,255,0.9), 0 0 60px rgba(0,200,255,0.5); }
    }
    ${[...Array(8)].map((_, i) => {
      const angle = (i / 8) * 360;
      const r = 200;
      const x = Math.cos((angle * Math.PI) / 180) * r;
      const y = Math.sin((angle * Math.PI) / 180) * r;
      return `
        @keyframes orbitParticle${i} {
          0%   { transform: translate(${x}px, ${y}px) scale(0.5); opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.8; }
          100% { transform: translate(${x}px, ${y}px) rotate(360deg) scale(1); opacity: 0; }
        }
      `;
    }).join('')}
    @keyframes shimmerSweep {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes emojiDrop {
      0%   { opacity: 0; transform: translateY(-20px) scale(0.5); }
      60%  { transform: translateY(4px) scale(1.15); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;

  return (
    <>
      <style>{styleTag}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        {/* ── Modal Card ── */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            maxWidth: '440px',
            width: '100%',
            background: 'linear-gradient(145deg, rgba(8,12,28,0.97) 0%, rgba(4,8,20,0.99) 100%)',
            border: isWeekly
              ? '1px solid rgba(255,200,50,0.3)'
              : '1px solid rgba(0,242,255,0.3)',
            borderRadius: '28px',
            overflow: 'hidden',
            animation: 'appreciationPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both, glowPulse 2.5s ease-in-out infinite 0.6s',
            boxShadow: isWeekly
              ? '0 0 40px rgba(255,180,0,0.2), 0 0 100px rgba(255,140,0,0.1), inset 0 1px 0 rgba(255,200,50,0.1)'
              : '0 0 40px rgba(0,242,255,0.18), 0 0 100px rgba(0,100,255,0.12), inset 0 1px 0 rgba(0,242,255,0.08)',
          }}
        >
          <ShimmerRing />

          {/* ── Top Accent Bar ── */}
          <div style={{
            height: '3px',
            background: isWeekly
              ? 'linear-gradient(90deg, #ff8c00, #ffd700, #ff8c00)'
              : 'linear-gradient(90deg, #00f2ff, #0066ff, #00f2ff)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSweep 2s linear infinite',
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              zIndex: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            aria-label="Close"
          >✕</button>

          {/* ── Body ── */}
          <div style={{ padding: '32px 32px 0', textAlign: 'center', position: 'relative', zIndex: 1 }}>

            {/* Big emoji */}
            <div style={{
              fontSize: '56px',
              marginBottom: '16px',
              animation: 'emojiDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
              lineHeight: 1,
            }}>
              {isWeekly ? '🏆' : '⚡'}
            </div>

            {/* Sub-label badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '100px',
              background: isWeekly ? 'rgba(255,180,0,0.1)' : 'rgba(0,242,255,0.08)',
              border: isWeekly ? '1px solid rgba(255,180,0,0.3)' : '1px solid rgba(0,242,255,0.25)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isWeekly ? '#ffd700' : '#00f2ff',
              marginBottom: '16px',
            }}>
              {isWeekly ? `✦ ${weekLabel} Conquered ✦` : `✦ Day ${dayNumber} Complete ✦`}
            </div>

            {/* Headline */}
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              lineHeight: 1.15,
              marginBottom: '12px',
              background: isWeekly
                ? 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ffd700 100%)'
                : 'linear-gradient(135deg, #00f2ff 0%, #4488ff 50%, #00f2ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: 'shimmerSweep 3s linear infinite',
            }}>
              {isWeekly ? `${weekLabel} Complete!` : dailyMsg.headline}
            </h2>

            {/* Body text */}
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.95rem',
              lineHeight: 1.65,
              marginBottom: '28px',
              padding: '0 4px',
            }}>
              {isWeekly ? weeklyBody : dailyMsg.body}
            </p>

            {/* ── Stats row (only for weekly) ── */}
            {isWeekly && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                marginBottom: '28px',
              }}>
                {[
                  { icon: '📅', label: '7 Days', sub: 'Completed' },
                  { icon: '🔥', label: '0 Skips', sub: 'Perfect Week' },
                  { icon: '⬆️', label: `Week ${weekNumber}`, sub: 'In the Books' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '12px 8px',
                    borderRadius: '14px',
                    background: 'rgba(255,180,0,0.06)',
                    border: '1px solid rgba(255,180,0,0.15)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                    <p style={{ color: '#ffd700', fontWeight: 900, fontSize: '13px', margin: 0 }}>{s.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: 0 }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* ── Auto-close countdown bar ── */}
          <div style={{ padding: '0 32px 32px', position: 'relative', zIndex: 1 }}>

            {/* Dismiss hint */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                Auto-closing…
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isWeekly ? '#ffd700' : '#00f2ff',
              }}>
                {Math.ceil(progress / 20)}s
              </span>
            </div>

            {/* Track */}
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '100px',
              overflow: 'hidden',
            }}>
              {/* Fill */}
              <div style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: '100px',
                background: isWeekly
                  ? 'linear-gradient(90deg, #ff8c00, #ffd700)'
                  : 'linear-gradient(90deg, #0066ff, #00f2ff)',
                boxShadow: isWeekly
                  ? '0 0 8px rgba(255,180,0,0.7)'
                  : '0 0 8px rgba(0,242,255,0.7)',
                transition: 'width 0.1s linear',
              }} />
            </div>

            {/* Keep going button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: isWeekly
                  ? 'linear-gradient(135deg, #ff8c00, #ffd700)'
                  : 'linear-gradient(135deg, #0055ee, #00d4ff)',
                color: isWeekly ? '#0a0600' : '#fff',
                fontWeight: 900,
                fontSize: '14px',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: isWeekly
                  ? '0 8px 30px rgba(255,180,0,0.35)'
                  : '0 8px 30px rgba(0,180,255,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isWeekly ? '⚡ Onwards to the Next Week!' : '💪 Let\'s Keep Going!'}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
