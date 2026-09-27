import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import gsap from 'gsap';

/**
 * LogoIntro — full-screen animated splash, plays on every visit.
 * Props:
 *   durationMs {number} — total intro length in ms (default 3000)
 *   onComplete {function} — called when splash is done
 */
export function LogoIntro({ durationMs = 3000, onComplete }) {
  const svgRef   = useRef(null);
  const [done, setDone] = useState(false);
  const prefersReduced = useReducedMotion();

  const finish = React.useCallback(() => {
    setDone(true);
    document.body.style.overflow = '';
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // Reduced motion: static logo for ~1s then reveal
    if (prefersReduced) {
      const t = setTimeout(finish, 1000);
      return () => clearTimeout(t);
    }

    // Lock scroll while intro plays
    document.body.style.overflow = 'hidden';

    const svg = svgRef.current;
    if (!svg) { finish(); return; }

    const pulsePath = svg.querySelector('#fs-pulse');
    const spark     = svg.querySelector('#fs-spark');
    const textRect  = svg.querySelector('#fs-text-rect');
    const logoGroup = svg.querySelector('#fs-logo-group');

    /* ── stroke-dashoffset setup ── */
    let pathLen = 0;
    if (pulsePath) {
      try { pathLen = pulsePath.getTotalLength(); } catch (_) { pathLen = 320; }
      gsap.set(pulsePath, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
    }
    if (spark)    gsap.set(spark,    { opacity: 0, scale: 0, transformOrigin: '50% 75%' });
    if (textRect) gsap.set(textRect, { attr: { width: 0 } });

    /* ── master timeline ── */
    const tl = gsap.timeline({
      onComplete: () => { setTimeout(finish, 80); }
    });

    /* 0.4–1.3s: pulse EKG draws in */
    if (pulsePath) {
      tl.to(pulsePath, {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: 'power2.out',
      }, 0.4);
    }

    /* 0.5–0.75s: orange spark flashes at peak */
    if (spark) {
      tl.to(spark, { opacity: 1, scale: 1.5, duration: 0.18, ease: 'back.out(2.5)' }, 0.5);
      tl.to(spark, { scale: 1.0, duration: 0.12, ease: 'power2.in' }, 0.68);
      tl.to(spark, { opacity: 0.75, duration: 0.2 }, 1.05);
    }

    /* 1.2–1.9s: wordmark wipe left→right */
    if (textRect) {
      tl.to(textRect, {
        attr: { width: 322 },
        duration: 0.72,
        ease: 'power2.out',
      }, 1.2);
    }

    /* 1.9–2.5s: gentle logo breathing hold */
    if (logoGroup) {
      tl.to(logoGroup, {
        scale: 1.03,
        duration: 0.32,
        ease: 'sine.inOut',
        transformOrigin: '116px 90px',
        yoyo: true,
        repeat: 1,
      }, 1.9);
    }

    /* 2.55–3.0s: fade + slight scale out (whole SVG element) */
    tl.to(svg, {
      opacity: 0,
      scale: 1.05,
      duration: 0.42,
      ease: 'power2.in',
      transformOrigin: '50% 50%',
    }, 2.55);

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [prefersReduced, finish]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="logo-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReduced ? 0.15 : 0.38, ease: [0.4, 0, 1, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0A0A0F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
          aria-label="FitStart loading"
          role="status"
        >
          {/* Ambient blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '8%', left: '2%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,60,0.07) 0%, transparent 65%)', animation: 'blobDrift 20s ease-in-out infinite alternate' }} />
            <div style={{ position: 'absolute', bottom: '8%', right: '2%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%)', animation: 'blobDrift 24s ease-in-out infinite alternate-reverse' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)' }} />
          </div>

          {/* Logo wrapper — spring entrance */}
          <motion.div
            initial={prefersReduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.58 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, mass: 0.9 }}
            style={{ width: 'min(540px, 88vw)', position: 'relative' }}
          >
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 560 180"
              role="img"
              aria-label="FitStart"
              style={{ width: '100%', display: 'block', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="fs-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#B6FF3C" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
                <filter id="fs-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* ClipPath for left→right wordmark wipe */}
                <clipPath id="fs-text-clip">
                  <rect id="fs-text-rect" x="248" y="44" width="0" height="96" />
                </clipPath>
              </defs>

              {/* Transparent background (card shape) */}
              <rect x="0" y="0" width="560" height="180" rx="28" fill="#0A0A0F" />

              {/* EKG pulse + arrow — animated stroke draw */}
              <g id="fs-logo-group" filter="url(#fs-glow)">
                <path
                  id="fs-pulse"
                  d="M40 112 H80 L96 112 L108 82 L122 140 L138 92 L158 112 L192 70"
                  fill="none"
                  stroke="url(#fs-grad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M192 70 L170 70 M192 70 L192 92"
                  fill="none"
                  stroke="url(#fs-grad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Orange bolt spark */}
              <path
                id="fs-spark"
                d="M206 58 L216 58 L210 70 L220 70 L204 92 L210 74 L200 74 Z"
                fill="#FF7A00"
                filter="url(#fs-glow)"
              />

              {/* Wordmark — clipped for wipe animation */}
              <g clipPath="url(#fs-text-clip)">
                <text
                  x="250"
                  y="114"
                  fontFamily="Poppins, Montserrat, Arial, sans-serif"
                  fontSize="60"
                  fontWeight="700"
                  fill="#FFFFFF"
                  letterSpacing="1"
                >
                  Fit<tspan fill="url(#fs-grad)">Start</tspan>
                </text>
              </g>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LogoIntro;
