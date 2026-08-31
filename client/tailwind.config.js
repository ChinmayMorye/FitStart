/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        /* New futuristic palette */
        'neon-cyan':    '#00F5FF',
        'neon-blue':    '#00F0FF',
        'neon-green':   '#00FF87',
        'neon-purple':  '#7C3AED',
        'neon-pink':    '#FF0080',
        'neon-gold':    '#FFB800',
        'neon-violet':  '#8A2BE2',
        /* Legacy */
        'neon-cyan-old': '#22d3ee',
        'soft-white':  '#F0F4FF',
        'dark-base':   '#020408',
        'dark-navy':   '#060d1a',
        'dark-card':   'rgba(6,13,26,0.6)',
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['Space Mono', 'JetBrains Mono', 'monospace'],
        grotesk: ['Space Grotesk', 'Inter', 'sans-serif'],
        outfit:  ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm':  '12px',
        'md':  '16px',
        'lg':  '20px',
        'xl':  '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        'glow-cyan':    '0 0 20px rgba(0,245,255,0.45), 0 0 50px rgba(0,245,255,0.18)',
        'glow-green':   '0 0 20px rgba(0,255,135,0.4), 0 0 45px rgba(0,255,135,0.15)',
        'glow-purple':  '0 0 20px rgba(124,58,237,0.4), 0 0 45px rgba(124,58,237,0.15)',
        'glow-pink':    '0 0 20px rgba(255,0,128,0.4), 0 0 45px rgba(255,0,128,0.15)',
        'glow-blue':    '0 0 20px rgba(0,180,216,0.4), 0 0 45px rgba(0,180,216,0.15)',
        'card':         '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        'modal':        '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px rgba(0,245,255,0.06)',
        'inner-glow':   'inset 0 0 20px rgba(0,245,255,0.06)',
        'inner-purple': 'inset 0 0 20px rgba(124,58,237,0.06)',
      },
      backdropBlur: {
        xs:  '4px',
        sm:  '8px',
        DEFAULT: '20px',
        lg:  '28px',
        xl:  '40px',
        '2xl': '60px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,245,255,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,245,255,0.65), 0 0 80px rgba(0,245,255,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
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
        aurora: {
          '0%':   { backgroundPosition: '0% 50%', transform: 'scale(1)' },
          '50%':  { backgroundPosition: '100% 50%', transform: 'scale(1.05)' },
          '100%': { backgroundPosition: '0% 50%', transform: 'scale(1)' },
        },
        statPop: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '70%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.88)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pingSlowAnim: {
          '0%':        { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        pingExpand: {
          '0%':   { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        hologramScan: {
          '0%':   { transform: 'translateY(-100%) skewX(-5deg)', opacity: '0' },
          '15%':  { opacity: '0.6' },
          '85%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(200%) skewX(-5deg)', opacity: '0' },
        },
        wordReveal: {
          '0%':   { opacity: '0', transform: 'translateY(40px) rotateX(20deg)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0deg)', filter: 'blur(0)' },
        },
        particleRise: {
          '0%':   { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-120px) scale(0)', opacity: '0' },
        },
        ringExpand: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        'fade-in':      'fadeIn 0.8s cubic-bezier(0.4,0,0.2,1) forwards',
        'fade-in-up':   'fadeInUp 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'floatSlow 10s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'gradient':     'gradientShift 4s ease infinite',
        'aurora':       'aurora 14s ease infinite',
        'border-spin':  'borderSpin 4s linear infinite',
        'scale-in':     'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':     'slideUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'stat-pop':     'statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'ping-slow':    'pingSlowAnim 2s cubic-bezier(0,0,0.2,1) infinite',
        'ping-expand':  'pingExpand 2s ease-out infinite',
        'hologram':     'hologramScan 5s ease-in-out infinite',
        'word-reveal':  'wordReveal 0.8s cubic-bezier(0.4,0,0.2,1) both',
        'particle-rise':'particleRise 3s ease-in-out infinite',
        'ring-expand':  'ringExpand 2.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}

