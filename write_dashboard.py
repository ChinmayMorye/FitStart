
code = r"""import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const T = {
  bgBase: '#0A0A0F', bgSurface: '#14141B', bgSurface2: '#1C1C26',
  border: '#26262F', border2: '#32323E',
  textPrimary: '#FFFFFF', textSecondary: '#A1A1AA', textMuted: '#6B6B76',
  lime: '#B6FF3C', cyan: '#00E5FF', orange: '#FF7A00',
  error: '#EF4444', success: '#22C55E',
  gradCta: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)',
};

const options = [
  { id: 'diet', iconType: 'nutrition', title: 'Diet Plan', subtitle: 'Personalized daily meal plans crafted to match your goals and body stats.', tags: ['Veg & Non-Veg', 'Macros Included', 'Daily Plans'], route: '/diet', accent: '#B6FF3C', gradient: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', bgGlow: 'rgba(182,255,60,0.08)', borderColor: 'rgba(182,255,60,0.25)', number: '01' },
  { id: 'workout', iconType: 'dumbbell', title: 'Workout Plan', subtitle: 'Structured exercise routines tailored to your body, goals, and schedule.', tags: ['Beginner Friendly', 'Custom Sets', 'Track Progress'], route: '/workout', accent: '#00E5FF', gradient: 'linear-gradient(135deg, #00E5FF 0%, #B6FF3C 100%)', bgGlow: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.25)', number: '02' },
];

function IconNutrition({ size = 24, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" /></svg>; }
function IconDumbbell({ size = 24, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v14M18 5v14" /><rect x="3" y="7" width="6" height="10" rx="1" /><rect x="15" y="7" width="6" height="10" rx="1" /><line x1="6" y1="12" x2="18" y2="12" /></svg>; }
function IconActivity({ size = 18, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function IconEdit({ size = 14, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function IconLogOut({ size = 14, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function IconX({ size = 14, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }
function IconArrow({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>; }
function IconAlert({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>; }
function IconCheck({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>; }
function IconChevron({ size = 12, color = 'currentColor', rotate = 0 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotate}deg)`, transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9" /></svg>; }
function IconRuler({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /></svg>; }
function IconScale({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3" /><path d="M6 21H18l-1-10H7L6 21z" /></svg>; }
function IconCalendar({ size = 16, color = 'currentColor' }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }

function getOptionIcon(type, size, color) {
  if (type === 'nutrition') return <IconNutrition size={size} color={color} />;
  if (type === 'dumbbell') return <IconDumbbell size={size} color={color} />;
  return null;
}

function AmbientBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(182,255,60,0.06) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-12%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: '-8%', left: '30%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,0,0.04) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 100%)' }} />
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ padding: '20px 16px', borderRadius: '16px', background: '#14141B', border: `1px solid ${color}28`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.boxShadow = `0 0 24px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ color, marginBottom: '4px' }}>{icon}</div>
      <p style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.5px', fontFamily: "'Space Mono', monospace", margin: 0 }}>{value}</p>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B76', fontWeight: 600, margin: 0 }}>{label}</p>
    </div>
  );
}

const modalOverlay = { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' };
const modalInput = { width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #26262F', color: '#fff', fontSize: '15px', fontWeight: 500, fontFamily: "'Inter', sans-serif", outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const modalLabel = { fontSize: '12px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '6px' };

function EditInfoModal({ currentHeight, currentWeight, currentAge, onSave, onClose, saving, error }) {
  const [height, setHeight] = useState(currentHeight || '');
  const [weight, setWeight] = useState(currentWeight || '');
  const [age, setAge] = useState(currentAge || '');
  const fCyan = e => { e.target.style.borderColor = 'rgba(0,229,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.08)'; };
  const bIn = e => { e.target.style.borderColor = '#26262F'; e.target.style.boxShadow = 'none'; };
  return (
    <div style={modalOverlay}>
      <div style={{ maxWidth: '420px', width: '100%', background: '#14141B', border: '1px solid #26262F', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        <div style={{ height: '2px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)' }} />
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div><h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Edit Body Info</h2><p style={{ color: '#6B6B76', fontSize: '13px', margin: '4px 0 0' }}>BMI recalculates instantly</p></div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #26262F', color: '#6B6B76', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6B6B76'}><IconX size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div><label style={modalLabel}>Height (cm)</label><input type="number" min="50" max="300" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" style={modalInput} onFocus={fCyan} onBlur={bIn} /></div>
            <div><label style={modalLabel}>Weight (kg)</label><input type="number" min="20" max="500" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" style={modalInput} onFocus={fCyan} onBlur={bIn} /></div>
            <div><label style={modalLabel}>Age (years)</label><input type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 22" style={modalInput} onFocus={fCyan} onBlur={bIn} /></div>
          </div>
          {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '14px' }}><IconAlert size={14} color="#f87171" /><p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p></div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '100px', background: 'transparent', border: '1px solid #32323E', color: '#A1A1AA', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>Cancel</button>
            <button onClick={() => onSave({ height: Number(height), weight: Number(weight), age: Number(age) })} disabled={saving || !height || !weight || !age} style={{ flex: 2, padding: '12px', borderRadius: '100px', border: 'none', background: (!saving && height && weight && age) ? 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)' : 'rgba(255,255,255,0.05)', color: (!saving && height && weight && age) ? '#0A0A0F' : '#6B6B76', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit', cursor: (!saving && height && weight && age) ? 'pointer' : 'not-allowed' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsernameModal({ currentName, onSave, onClose, saving, error }) {
  const [val, setVal] = useState(currentName || '');
  return (
    <div style={modalOverlay}>
      <div style={{ maxWidth: '420px', width: '100%', background: '#14141B', border: '1px solid #26262F', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        <div style={{ height: '2px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)' }} />
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div><h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Change Username</h2><p style={{ color: '#6B6B76', fontSize: '13px', margin: '4px 0 0' }}>Your display name across FitStart</p></div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #26262F', color: '#6B6B76', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#6B6B76'}><IconX size={14} /></button>
          </div>
          <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave(val)} placeholder="Enter new username..." maxLength={30} autoFocus style={{ ...modalInput, marginBottom: '8px' }} onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.08)'; }} onBlur={e => { e.target.style.borderColor = '#26262F'; e.target.style.boxShadow = 'none'; }} />
          {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '14px', marginTop: '8px' }}><IconAlert size={14} color="#f87171" /><p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p></div>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '100px', background: 'transparent', border: '1px solid #32323E', color: '#A1A1AA', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}>Cancel</button>
            <button onClick={() => onSave(val)} disabled={!val.trim() || saving} style={{ flex: 2, padding: '12px', borderRadius: '100px', border: 'none', background: val.trim() && !saving ? 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)' : 'rgba(255,255,255,0.05)', color: val.trim() && !saving ? '#0A0A0F' : '#6B6B76', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit', cursor: val.trim() && !saving ? 'pointer' : 'not-allowed' }}>{saving ? 'Saving...' : 'Save Username'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user: propUser, token, onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(propUser || JSON.parse(localStorage.getItem('fitstart_user') || '{}'));
  const [hovered, setHovered] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const profileMenuRef = useRef(null);
  const authToken = token || localStorage.getItem('fitstart_token') || '';

  const bmi = user.height && user.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese') : 'BMI';
  const bmiColor = bmi ? (bmi < 18.5 ? '#00E5FF' : bmi < 25 ? '#B6FF3C' : bmi < 30 ? '#FF7A00' : '#EF4444') : '#6B6B76';
  const initials = (user.username || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    const h = e => { if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setProfileMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (saveSuccess) { const t = setTimeout(() => setSaveSuccess(''), 3000); return () => clearTimeout(t); }
  }, [saveSuccess]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) { const d = await res.json(); setUser(d); localStorage.setItem('fitstart_user', JSON.stringify(d)); }
    } catch { }
  }, [authToken]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSaveInfo = async ({ height, weight, age }) => {
    setModalSaving(true); setModalError('');
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ height, weight, age }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setUser(prev => ({ ...prev, height, weight, age }));
      localStorage.setItem('fitstart_user', JSON.stringify({ ...user, height, weight, age }));
      setShowEditModal(false); setSaveSuccess('Body stats updated!');
    } catch (err) { setModalError(err.message); }
    setModalSaving(false);
  };

  const handleSaveUsername = async newUsername => {
    if (!newUsername.trim()) return;
    setModalSaving(true); setModalError('');
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ username: newUsername.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setUser(prev => ({ ...prev, username: newUsername.trim() }));
      localStorage.setItem('fitstart_user', JSON.stringify({ ...user, username: newUsername.trim() }));
      setShowUsernameModal(false); setSaveSuccess('Username updated!');
    } catch (err) { setModalError(err.message); }
    setModalSaving(false);
  };

  const handleLogout = () => { localStorage.removeItem('fitstart_token'); localStorage.removeItem('fitstart_user'); onLogout?.(); navigate('/login'); };
  const openModal = type => { setModalError(''); setProfileMenuOpen(false); if (type === 'info') setShowEditModal(true); if (type === 'username') setShowUsernameModal(true); };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <AmbientBg />

      {saveSuccess && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 3000, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '100px', background: 'rgba(182,255,60,0.12)', border: '1px solid rgba(182,255,60,0.35)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease' }}>
          <IconCheck size={14} color="#B6FF3C" />
          <span style={{ color: '#B6FF3C', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{saveSuccess}</span>
        </div>
      )}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 48px)', background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid #26262F' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(182,255,60,0.35) 40%, rgba(0,229,255,0.35) 60%, transparent)', backgroundSize: '200% 100%', animation: 'borderSpin 5s linear infinite' }} />
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: '#0A0A0F', boxShadow: '0 0 16px rgba(182,255,60,0.35)' }}>F</div>
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>FitStart</span>
        </button>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconActivity size={14} color="#B6FF3C" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#A1A1AA', whiteSpace: 'nowrap' }}>Welcome back, <span style={{ color: '#fff', fontWeight: 700 }}>{user.username || 'Champion'}</span></span>
        </div>
        <div ref={profileMenuRef} style={{ position: 'relative' }}>
          <button id="profile-avatar-btn" onClick={() => setProfileMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${profileMenuOpen ? 'rgba(182,255,60,0.4)' : '#26262F'}`, borderRadius: '100px', padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '36px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0A0A0F', flexShrink: 0 }}>{initials}</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#A1A1AA', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username || 'User'}</span>
            <IconChevron size={10} color="#6B6B76" rotate={profileMenuOpen ? 180 : 0} />
          </button>
          {profileMenuOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', background: '#14141B', border: '1px solid #26262F', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.7)', animation: 'fadeIn 0.15s ease' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #26262F' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{user.username || 'User'}</p>
                <p style={{ fontSize: '11px', color: '#6B6B76', margin: '2px 0 0', fontFamily: "'Space Mono', monospace" }}>FitStart member</p>
              </div>
              {[{ label: 'Edit Username', action: () => openModal('username') }, { label: 'Edit Body Stats', action: () => openModal('info') }].map(item => (
                <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '11px 14px', background: 'transparent', border: 'none', color: '#A1A1AA', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', display: 'block' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A1A1AA'; }}>{item.label}</button>
              ))}
              <div style={{ borderTop: '1px solid #26262F', padding: '6px' }}>
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.15s', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: 'clamp(80px, 12vw, 96px) clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)' }}>
        <div style={{ marginBottom: 'clamp(32px, 5vw, 48px)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', background: 'rgba(182,255,60,0.07)', border: '1px solid rgba(182,255,60,0.22)', fontSize: '11px', fontWeight: 700, color: '#B6FF3C', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginBottom: '16px' }}>
            <span style={{ width: '6px', height: '6px', background: '#B6FF3C', borderRadius: '50%', boxShadow: '0 0 8px #B6FF3C', display: 'inline-block' }} />
            Dashboard
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', margin: '0 0 8px', lineHeight: 1.15 }}>
            Ready to crush it,{' '}
            <span style={{ background: 'linear-gradient(135deg, #B6FF3C 0%, #00E5FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user.username || 'Champion'}</span>?
          </h1>
          <p style={{ color: '#6B6B76', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>Your personalized hub for diet, workouts, and progress tracking.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <StatCard icon={<IconRuler size={18} color="#00E5FF" />} value={user.height ? `${user.height}cm` : '—'} label="Height" color="#00E5FF" />
          <StatCard icon={<IconScale size={18} color="#B6FF3C" />} value={user.weight ? `${user.weight}kg` : '—'} label="Weight" color="#B6FF3C" />
          <StatCard icon={<IconCalendar size={18} color="#FF7A00" />} value={user.age ? `${user.age}yr` : '—'} label="Age" color="#FF7A00" />
          <StatCard icon={<IconActivity size={18} color={bmiColor} />} value={bmi || '—'} label={bmiLabel} color={bmiColor} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          {options.map(opt => (
            <button key={opt.id} id={`option-card-${opt.id}`} onClick={() => navigate(opt.route)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}
              style={{ display: 'block', textAlign: 'left', width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '28px', borderRadius: '20px', overflow: 'hidden', position: 'relative', background: hovered === opt.id ? opt.bgGlow : '#14141B', borderWidth: '1px', borderStyle: 'solid', borderColor: hovered === opt.id ? opt.borderColor : '#26262F', transform: hovered === opt.id ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hovered === opt.id ? `0 20px 48px ${opt.bgGlow}` : '0 2px 16px rgba(0,0,0,0.4)', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: opt.gradient, opacity: hovered === opt.id ? 1 : 0, transition: 'opacity 0.3s ease' }} />
              <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '11px', fontWeight: 700, color: '#6B6B76', fontFamily: "'Space Mono', monospace" }}>{opt.number}</div>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', marginBottom: '20px', background: hovered === opt.id ? `${opt.accent}18` : 'rgba(255,255,255,0.04)', border: hovered === opt.id ? `1px solid ${opt.accent}35` : '1px solid #26262F', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', transform: hovered === opt.id ? 'scale(1.08)' : 'scale(1)' }}>
                {getOptionIcon(opt.iconType, 24, hovered === opt.id ? opt.accent : '#6B6B76')}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.25px', marginBottom: '8px' }}>{opt.title}</h3>
              <p style={{ color: '#6B6B76', fontSize: '14px', lineHeight: 1.65, marginBottom: '20px' }}>{opt.subtitle}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                {opt.tags.map(tag => (
                  <span key={tag} style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: hovered === opt.id ? `${opt.accent}10` : 'rgba(255,255,255,0.04)', border: hovered === opt.id ? `1px solid ${opt.accent}28` : '1px solid #26262F', color: hovered === opt.id ? opt.accent : '#6B6B76', transition: 'all 0.25s', fontFamily: "'Space Mono', monospace" }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: `1px solid ${hovered === opt.id ? `${opt.accent}20` : '#26262F'}`, transition: 'border-color 0.25s' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: hovered === opt.id ? opt.accent : '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace", transition: 'color 0.25s' }}>Open</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: hovered === opt.id ? opt.gradient : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', transform: hovered === opt.id ? 'translateX(4px)' : 'translateX(0)' }}>
                  <IconArrow size={14} color={hovered === opt.id ? '#0A0A0F' : '#6B6B76'} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#14141B', border: '1px solid #26262F', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>Quick Actions</p>
            <p style={{ fontSize: '12px', color: '#6B6B76', margin: '2px 0 0' }}>Manage your profile and data</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Edit Body Stats', action: () => openModal('info'), color: '#00E5FF' },
              { label: 'Change Username', action: () => openModal('username'), color: '#B6FF3C' },
              { label: 'Sign Out', action: handleLogout, color: '#f87171', danger: true },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '100px', background: btn.danger ? 'transparent' : `${btn.color}0D`, border: `1px solid ${btn.danger ? 'rgba(239,68,68,0.25)' : `${btn.color}28`}`, color: btn.color, fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s', minHeight: '38px' }}
                onMouseEnter={e => { e.currentTarget.style.background = btn.danger ? 'rgba(239,68,68,0.08)' : `${btn.color}18`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = btn.danger ? 'transparent' : `${btn.color}0D`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#6B6B76', fontSize: '12px', marginTop: '48px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>FitStart \u00a9 {new Date().getFullYear()} \u2014 Built for champions</p>
      </div>

      {showEditModal && <EditInfoModal currentHeight={user.height} currentWeight={user.weight} currentAge={user.age} onSave={handleSaveInfo} onClose={() => setShowEditModal(false)} saving={modalSaving} error={modalError} />}
      {showUsernameModal && <UsernameModal currentName={user.username} onSave={handleSaveUsername} onClose={() => setShowUsernameModal(false)} saving={modalSaving} error={modalError} />}
    </div>
  );
}

export default Dashboard;
"""

with open(r'C:\Users\DELL\Desktop\FitStart\client\src\pages\Dashboard.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done. Lines:', code.count('\n'))
