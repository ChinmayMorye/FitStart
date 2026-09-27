/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {

      /* ── Design Tokens: Colors ── */
      colors: {
        /* Brand backgrounds */
        'fs-base':      '#0A0A0F',
        'fs-surface':   '#14141B',
        'fs-surface-2': '#1C1C26',
        'fs-border':    '#26262F',
        'fs-border-2':  '#32323E',

        /* Brand text */
        'fs-text':       '#FFFFFF',
        'fs-text-2':     '#A1A1AA',
        'fs-text-muted': '#6B6B76',

        /* Brand accents — ONLY use for CTAs, numbers, active states */
        'fs-lime':   '#B6FF3C',
        'fs-cyan':   '#00E5FF',
        'fs-orange': '#FF7A00',

        /* Semantic */
        'fs-success':  '#22C55E',
        'fs-error':    '#EF4444',
        'fs-warning':  '#F59E0B',

        /* Legacy / compatibility — keep old classes working */
        'neon-cyan':   '#00E5FF',
        'neon-green':  '#B6FF3C',
        'neon-purple': '#7C3AED',
        'neon-pink':   '#FF7A00',
        'neon-gold':   '#FF7A00',
        'soft-white':  '#FFFFFF',
        'dark-base':   '#0A0A0F',
        'dark-navy':   '#14141B',
        'dark-card':   '#1C1C26',
      },

      /* ── Design Tokens: Typography ── */
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['Space Mono', 'JetBrains Mono', 'monospace'],
        // keep for backwards compat
        grotesk: ['Inter', 'sans-serif'],
        outfit:  ['Inter', 'sans-serif'],
      },

      /* ── Design Tokens: Font sizes (type scale) ── */
      fontSize: {
        'fs-caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'fs-small':   ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'fs-body':    ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'fs-h3':      ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'fs-h2':      ['28px', { lineHeight: '1.25', fontWeight: '600' }],
        'fs-h1':      ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'fs-display': ['56px', { lineHeight: '1.1', fontWeight: '700' }],
      },

      /* ── Design Tokens: Spacing (8px grid) ── */
      spacing: {
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '6':  '24px',
        '8':  '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
        /* keep Tailwind defaults for flex/grid utilities */
        '0.5': '2px',
        '5':   '20px',
        '7':   '28px',
        '9':   '36px',
        '10':  '40px',
        '11':  '44px',
        '14':  '56px',
        '20':  '80px',
        '28':  '112px',
        '32':  '128px',
        '36':  '144px',
        '40':  '160px',
        '48':  '192px',
        '56':  '224px',
        '64':  '256px',
        '72':  '288px',
        '80':  '320px',
        '96':  '384px',
      },

      /* ── Design Tokens: Border Radius ── */
      borderRadius: {
        'none': '0',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',
        '3xl':  '32px',
        'full': '9999px',
      },

      /* ── Design Tokens: Shadows / Elevation ── */
      boxShadow: {
        /* Elevation tiers */
        'elev-1': '0 1px 3px rgba(0,0,0,0.5)',
        'elev-2': '0 4px 16px rgba(0,0,0,0.6)',
        'elev-3': '0 8px 32px rgba(0,0,0,0.7)',
        'elev-4': '0 16px 64px rgba(0,0,0,0.8)',
        /* Accent glows — use sparingly */
        'glow-lime':   '0 0 24px rgba(182,255,60,0.35)',
        'glow-cyan':   '0 0 24px rgba(0,229,255,0.35)',
        'glow-orange': '0 0 24px rgba(255,122,0,0.4)',
        /* Card */
        'card':  '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'modal': '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
        /* Legacy compat */
        'glow-green':  '0 0 20px rgba(182,255,60,0.35)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.4)',
        'glow-pink':   '0 0 20px rgba(255,122,0,0.4)',
      },

      /* ── Design Tokens: Max Width ── */
      maxWidth: {
        'content': '1280px',
        'prose':   '68ch',
      },

      /* ── Keyframes (static only — no motion) ── */
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        statPop: {
          '0%':   { opacity: '0', transform: 'scale(0.88) translateY(12px)' },
          '70%':  { transform: 'scale(1.03) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        cardReveal: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        borderSpin: {
          from: { backgroundPosition: '0% 0%' },
          to:   { backgroundPosition: '200% 0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-24px)' },
        },
        shimmerScan: {
          '0%':   { left: '-100%', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { left: '120%', opacity: '0' },
        },
        pingSlowAnim: {
          '0%':        { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        journeyReveal: {
          '0%':   { opacity: '0', filter: 'blur(8px)', transform: 'scale(0.95)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
        },
        rotateGlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0,229,255,0.25)' },
          '50%':      { boxShadow: '0 0 32px rgba(0,229,255,0.55)' },
        },
        shimmerSweep: {
          '0%':   { left: '-100%', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { left: '200%', opacity: '0' },
        },
        numberRoll: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'fade-in':       'fadeIn 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-in-up':    'fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) forwards',
        'scale-in':      'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'stat-pop':      'statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'card-reveal':   'cardReveal 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'gradient':      'gradientShift 4s ease infinite',
        'border-spin':   'borderSpin 4s linear infinite',
        'float':         'float 7s ease-in-out infinite',
        'float-2':       'float2 9s ease-in-out infinite',
        'shimmer-scan':  'shimmerScan 3.5s ease-in-out infinite',
        'ping-slow':     'pingSlowAnim 2s cubic-bezier(0,0,0.2,1) infinite',
        'shake':         'shake 0.4s ease-in-out',
        'journey-reveal':'journeyReveal 1.8s cubic-bezier(0.4,0,0.2,1) forwards',
        'rotate-glow':   'rotateGlow 0.8s linear infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'shimmer-sweep': 'shimmerSweep 3.5s ease-in-out infinite',
        'number-roll':   'numberRoll 0.4s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards',
        /* aliases for old class names */
        'float-slow':    'float 10s ease-in-out infinite',
        'border-glow':   'glowPulse 3s ease-in-out infinite',
        'animate-float': 'float 7s ease-in-out infinite',
      },

      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        DEFAULT: '16px',
        lg:  '24px',
        xl:  '40px',
      },
    },
  },
  plugins: [],
};
