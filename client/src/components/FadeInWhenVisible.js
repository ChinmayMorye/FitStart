import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { variants } from '../motion.config';

/**
 * FadeInWhenVisible
 * Wraps children in a Framer Motion div that fades + rises on viewport enter.
 * Respects prefers-reduced-motion (falls back to fade-only).
 *
 * Props:
 *   delay     {number}  — seconds before animation starts (default 0)
 *   threshold {number}  — viewport fraction to trigger (default 0.15)
 *   style     {object}
 *   className {string}
 */
export function FadeInWhenVisible({ children, delay = 0, threshold = 0.15, style = {}, className = '' }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={prefersReduced ? variants.fade : variants.fadeUp}
      transition={{ delay }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer
 * Parent that triggers stagger on viewport enter.
 */
export function StaggerContainer({ children, style = {}, className = '', threshold = 0.1 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={variants.stagger}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem
 * Child of StaggerContainer — inherits stagger delay automatically.
 */
export function StaggerItem({ children, style = {}, className = '' }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? variants.fade : variants.fadeUp}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionButton
 * Reusable animated button with hover scale + glow and tap press.
 */
export function MotionButton({ children, style = {}, className = '', onClick, disabled, id, type = 'button', glowColor = 'rgba(182,255,60,0.35)' }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={prefersReduced || disabled ? {} : {
        scale: 1.03,
        boxShadow: `0 0 20px ${glowColor}`,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      }}
      whileTap={prefersReduced || disabled ? {} : {
        scale: 0.97,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * MotionCard
 * Surface card with soft lift + subtle tilt on hover.
 */
export function MotionCard({ children, style = {}, className = '', onClick }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      whileHover={prefersReduced ? {} : {
        y: -6,
        scale: 1.01,
        transition: { type: 'spring', stiffness: 200, damping: 22 },
      }}
      whileTap={prefersReduced ? {} : {
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 40 },
      }}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default FadeInWhenVisible;
