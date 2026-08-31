import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Step config ───────────────────────────────────────────────────────────────
const steps = [
  {
    id: 'height',
    label: 'Height',
    unit: 'cm',
    icon: '📏',
    placeholder: '175',
    min: 100,
    max: 250,
    question: "How tall are you?",
    sub: "We'll use this to personalize your fitness plan",
    color: '#00F0FF',
    gradient: 'linear-gradient(135deg, #00F0FF, #06b6d4)',
    glow: 'rgba(0,240,255,0.25)',
    tips: ['Average: 170 cm', 'Affects calorie targets', 'Used for BMI'],
  },
  {
    id: 'age',
    label: 'Age',
    unit: 'yrs',
    icon: '🎂',
    placeholder: '22',
    min: 10,
    max: 100,
    question: "How old are you?",
    sub: "Age helps us set the right intensity for your journey",
    color: '#8A2BE2',
    gradient: 'linear-gradient(135deg, #8A2BE2, #ec4899)',
    glow: 'rgba(138,43,226,0.25)',
    tips: ['Affects recovery time', 'Personalizes intensity', 'Optimizes your plan'],
  },
  {
    id: 'weight',
    label: 'Weight',
    unit: 'kg',
    icon: '⚖️',
    placeholder: '70',
    min: 20,
    max: 300,
    question: "What's your current weight?",
    sub: "Helps us calculate your BMI and optimal nutrition",
    color: '#39FF14',
    gradient: 'linear-gradient(135deg, #39FF14, #06b6d4)',
    glow: 'rgba(57,255,20,0.25)',
    tips: ['Calculates BMI', 'Sets calorie goals', 'Tracks progress'],
  },
];

// ─── BMI helpers ─────────────────────────────────────────────────────────────
function getBMI(weight, height) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h === 0) return null;
  return (w / Math.pow(h / 100, 2)).toFixed(1);
}
function getBMIStatus(bmi) {
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: 'Underweight', color: '#60a5fa', emoji: '📉' };
  if (b < 25)   return { label: 'Healthy',     color: '#39FF14', emoji: '✅' };
  if (b < 30)   return { label: 'Overweight',  color: '#f59e0b', emoji: '⚠️' };
  return           { label: 'Obese',          color: '#ef4444', emoji: '⚠️' };
}

// ─── Animated number ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, unit, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: '6px',
    }}>
      <span style={{
        fontSize: '88px',
        fontWeight: 900,
        letterSpacing: '-6px',
        lineHeight: 1,
        color,
        textShadow: `0 0 60px ${color}60`,
        transition: 'color 0.3s ease',
      }}>{value || '—'}</span>
      <span style={{
        fontSize: '28px',
        fontWeight: 700,
        color: `${color}80`,
        letterSpacing: '-1px',
      }}>{value ? unit : ''}</span>
    </div>
  );
}

// ─── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {steps.map((s, i) => {
        const isDone   = i < current;
        const isActive = i === current;
        return (
          <div
            key={i}
            style={{
              height: '4px',
              borderRadius: '99px',
              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              width: isActive ? '32px' : '14px',
              background: isDone
                ? '#39FF14'
                : isActive
                ? `linear-gradient(90deg, ${s.color}, ${steps[i > 0 ? i - 1 : i].color})`
                : 'rgba(255,255,255,0.12)',
              boxShadow: isActive ? `0 0 12px ${s.color}80` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Tip pill ────────────────────────────────────────────────────────────────
function TipPill({ text, color }) {
  return (
    <div style={{
      padding: '5px 14px',
      borderRadius: '100px',
      background: `${color}10`,
      border: `1px solid ${color}25`,
      color: `${color}`,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>{text}</div>
  );
}

// ─── Main Onboarding ─────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values,      setValues]      = useState({ height: '', age: '', weight: '' });
  const [error,       setError]       = useState('');
  const [direction,   setDirection]   = useState(1);  // 1 = forward, -1 = backward
  const [animating,   setAnimating]   = useState(false);
  const navigate = useNavigate();

  const step     = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // BMI preview (only on weight step)
  const bmi       = step.id === 'weight' ? getBMI(values.weight, values.height) : null;
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  // Clear error when value changes
  useEffect(() => { setError(''); }, [currentStep]);

  const goNext = () => {
    const val = parseFloat(values[step.id]);
    if (!values[step.id] || isNaN(val) || val < step.min || val > step.max) {
      setError(`Enter a valid ${step.label.toLowerCase()} (${step.min}–${step.max} ${step.unit})`);
      return;
    }
    setError('');
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(s => s + 1);
        setAnimating(false);
      }, 280);
    } else {
      onComplete(values);
      navigate('/dashboard');
    }
  };

  const goBack = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(s => s - 1);
      setError('');
      setAnimating(false);
    }, 280);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #020408 0%, #060d1e 40%, #020408 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem',
    }}>
      {/* ── Ambient orbs ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: `radial-gradient(circle, ${step.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', transition: 'background 0.6s ease',
        filter: 'blur(40px)',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
      }}/>

      {/* ── Dot grid ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }}/>

      {/* ── Top bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '22px', fontWeight: 900, fontStyle: 'italic',
            letterSpacing: '-1px', color: '#00F0FF',
            textShadow: '0 0 20px rgba(0,240,255,0.6)',
          }}>FITSTART</span>
        </div>

        {/* Step indicator pills */}
        <StepIndicator steps={steps} current={currentStep} />

        {/* Step counter */}
        <span style={{
          fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.08em',
        }}>
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* ── Main card ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction * 40}px) scale(0.96)`
            : 'translateX(0) scale(1)',
          transition: 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Emoji + Glow */}
        <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative' }}>
          <div style={{
            fontSize: '72px',
            lineHeight: 1,
            display: 'inline-block',
            animation: 'float 3s ease-in-out infinite',
            filter: `drop-shadow(0 0 30px ${step.glow})`,
            userSelect: 'none',
          }}>{step.icon}</div>
          {/* Glow ring behind emoji */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120px', height: '120px', borderRadius: '50%',
            background: `radial-gradient(circle, ${step.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}/>
        </div>

        {/* Question */}
        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 36px)',
          fontWeight: 900,
          color: '#fff',
          textAlign: 'center',
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          marginBottom: '10px',
        }}>
          {step.question}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          fontSize: '14px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          {step.sub}
        </p>

        {/* ── Animated large number display ── */}
        <div style={{ marginBottom: '8px', minHeight: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatedNumber value={values[step.id]} unit={step.unit} color={step.color} />
        </div>

        {/* ── Neon number input ── */}
        <div style={{ position: 'relative', marginBottom: error ? '8px' : '24px' }}>
          <input
            key={step.id}
            type="number"
            inputMode="numeric"
            value={values[step.id]}
            onChange={e => {
              setValues(v => ({ ...v, [step.id]: e.target.value }));
              setError('');
            }}
            onKeyDown={e => e.key === 'Enter' && goNext()}
            placeholder={step.placeholder}
            autoFocus
            style={{
              width: '100%',
              padding: '18px 70px 18px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : `${step.color}30`}`,
              borderRadius: '16px',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 700,
              outline: 'none',
              caretColor: step.color,
              transition: 'border-color 0.3s, box-shadow 0.3s',
              letterSpacing: '-0.5px',
              boxShadow: error
                ? '0 0 20px rgba(239,68,68,0.1)'
                : `0 0 0 0 ${step.color}`,
            }}
            onFocus={e => {
              e.target.style.borderColor = `${step.color}70`;
              e.target.style.boxShadow   = `0 0 0 4px ${step.glow}, 0 0 30px ${step.glow}`;
            }}
            onBlur={e => {
              e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : `${step.color}30`;
              e.target.style.boxShadow   = 'none';
            }}
          />
          {/* Unit badge */}
          <div style={{
            position: 'absolute',
            right: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '5px 12px',
            borderRadius: '8px',
            background: `${step.color}15`,
            border: `1px solid ${step.color}30`,
            color: step.color,
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}>{step.unit}</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.25)',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '14px' }}>⚠️</span>
            <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* ── Tip pills ── */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '28px',
        }}>
          {step.tips.map((t, i) => (
            <TipPill key={i} text={t} color={step.color} />
          ))}
        </div>

        {/* ── BMI preview (weight step only) ── */}
        {step.id === 'weight' && bmi && bmiStatus && (
          <div style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: `${bmiStatus.color}08`,
            border: `1px solid ${bmiStatus.color}25`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.4s ease',
          }}>
            <div>
              <p style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                marginBottom: '4px',
              }}>YOUR BMI PREVIEW</p>
              <p style={{
                fontSize: '28px', fontWeight: 900, color: bmiStatus.color,
                letterSpacing: '-1px', lineHeight: 1,
              }}>{bmi}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{bmiStatus.emoji}</div>
              <span style={{
                padding: '4px 12px', borderRadius: '99px',
                background: `${bmiStatus.color}15`,
                border: `1px solid ${bmiStatus.color}30`,
                color: bmiStatus.color,
                fontSize: '12px', fontWeight: 800,
              }}>{bmiStatus.label}</span>
            </div>
          </div>
        )}

        {/* ── CTA Button ── */}
        <button
          onClick={goNext}
          className="btn-primary w-full"
          style={{
            padding: '16px',
            fontSize: '16px',
            fontWeight: 800,
            borderRadius: '16px',
            background: step.gradient,
            boxShadow: `0 8px 32px ${step.glow}`,
            letterSpacing: '-0.3px',
            marginBottom: '14px',
          }}
        >
          {currentStep < steps.length - 1
            ? `Continue → (${step.label} set!)`
            : "Let's Start My Journey 🚀"}
        </button>

        {/* Back link */}
        {currentStep > 0 && (
          <button
            onClick={goBack}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
          >
            ← Back to {steps[currentStep - 1].label}
          </button>
        )}
      </div>

      {/* Progress bar (bottom) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(255,255,255,0.05)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: step.gradient,
          boxShadow: `0 0 12px ${step.glow}`,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
          borderTopRightRadius: '2px',
          borderBottomRightRadius: '2px',
        }}/>
      </div>

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(-3deg); }
          66%       { transform: translateY(-6px) rotate(3deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
