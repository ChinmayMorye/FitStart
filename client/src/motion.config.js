// ─── FitStart Motion Config ──────────────────────────────────────────────────
// Single source of truth for all animation values.

export const dur = {
  micro:      0.15,
  fast:       0.25,
  transition: 0.35,
  slow:       0.55,
  splash:     3.0,
};

export const spring = {
  snappy: { type: 'spring', stiffness: 260, damping: 20 },
  gentle: { type: 'spring', stiffness: 200, damping: 22 },
  bouncy: { type: 'spring', stiffness: 320, damping: 18, mass: 0.8 },
  rigid:  { type: 'spring', stiffness: 400, damping: 40 },
};

export const ease = {
  out:   [0.16, 1, 0.3, 1],
  in:    [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  bounce:[0.34, 1.56, 0.64, 1],
};

export const variants = {
  page: {
    initial:  { opacity: 0, y: 16 },
    animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit:     { opacity: 0, y: -16, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
  },
  fadeUp: {
    hidden:  { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  },
  fade: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.55 } },
  },
  card: {
    rest:  { y: 0, scale: 1 },
    hover: { y: -6, scale: 1.01, transition: { type: 'spring', stiffness: 200, damping: 22 } },
    tap:   { scale: 0.98, y: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
  },
  button: {
    rest:  { scale: 1 },
    hover: { scale: 1.03, transition: { type: 'spring', stiffness: 260, damping: 20 } },
    tap:   { scale: 0.97, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  },
  modal: {
    hidden:  { opacity: 0, scale: 0.92, y: 16 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
    exit:    { opacity: 0, scale: 0.94, y: 8, transition: { duration: 0.25 } },
  },
  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  },
};
