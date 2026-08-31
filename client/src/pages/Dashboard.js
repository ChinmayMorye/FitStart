import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const options = [
  {
    id: 'diet',
    icon: '🥗',
    title: 'Diet Plan',
    subtitle: 'Personalized daily meal plans crafted to match your goals and body stats.',
    tags: ['Veg & Non-Veg', 'Macros Included', 'Daily Plans'],
    route: '/diet',
    accent: '#00FF87',
    accentB: '#00F5FF',
    gradient: 'linear-gradient(135deg, #00FF87, #00F5FF)',
    bgGlow: 'rgba(0,255,135,0.09)',
    borderColor: 'rgba(0,255,135,0.28)',
    tagColor: 'rgba(0,255,135,0.1)',
    tagBorder: 'rgba(0,255,135,0.22)',
    tagText: '#00FF87',
    number: '01',
  },
  {
    id: 'workout',
    icon: '🏋️',
    title: 'Workout Plan',
    subtitle: 'Structured exercise routines tailored to your body, goals, and schedule.',
    tags: ['Beginner Friendly', 'Custom Sets', 'Track Progress'],
    route: '/workout',
    accent: '#7C3AED',
    accentB: '#FF0080',
    gradient: 'linear-gradient(135deg, #7C3AED, #FF0080)',
    bgGlow: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.3)',
    tagColor: 'rgba(124,58,237,0.1)',
    tagBorder: 'rgba(124,58,237,0.25)',
    tagText: '#a78bfa',
    number: '02',
  },
];


function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Neon cyan top-left */}
      <div className="absolute animate-float" style={{ top: '-120px', left: '-120px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,245,255,0.09) 0%, transparent 65%)', borderRadius: '50%', animationDuration: '12s' }} />
      {/* Purple top-right */}
      <div className="absolute animate-float-2" style={{ top: '-80px', right: '-120px', width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(124,58,237,0.11) 0%, transparent 65%)', borderRadius: '50%', animationDuration: '14s' }} />
      {/* Center subtle cyan */}
      <div className="absolute animate-float" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 65%)', borderRadius: '50%', animationDuration: '18s' }} />
      {/* Bottom-right pink */}
      <div className="absolute animate-float-2" style={{ bottom: '-140px', right: '-80px', width: '580px', height: '580px', background: 'radial-gradient(circle, rgba(255,0,128,0.08) 0%, transparent 65%)', borderRadius: '50%', animationDuration: '10s' }} />
      {/* Green bottom-left */}
      <div className="absolute animate-float" style={{ bottom: '-60px', left: '-60px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,255,135,0.06) 0%, transparent 65%)', borderRadius: '50%', animationDuration: '16s' }} />
      {/* Cyber grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,245,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.02) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
    </div>
  );
}


function StatCard({ icon, value, label, color, delay, bgGrad }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center p-5 rounded-2xl text-center overflow-hidden"
      style={{
        background: bgGrad || 'rgba(6,13,26,0.6)',
        border: `1px solid ${color}28`,
        animation: `statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
        boxShadow: `0 0 30px ${color}18, 0 8px 32px rgba(0,0,0,0.5)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 0 50px ${color}30, 0 16px 48px rgba(0,0,0,0.6)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = `0 0 30px ${color}18, 0 8px 32px rgba(0,0,0,0.5)`; }}
    >
      {/* Top shimmer line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      <div style={{ fontSize: '1.9rem', marginBottom: '8px' }}>{icon}</div>
      <p className="text-2xl font-black" style={{ color, fontFamily: "'Space Mono', monospace", letterSpacing: '-1px', textShadow: `0 0 20px ${color}60` }}>{value}</p>
      <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(180,200,240,0.35)' }}>{label}</p>
    </div>
  );
}


// ─── Edit Body Info Modal ────────────────────────────────────────────────────
function EditInfoModal({ currentHeight, currentWeight, currentAge, onSave, onClose, saving, error }) {
  const [height, setHeight] = useState(currentHeight || '');
  const [weight, setWeight] = useState(currentWeight || '');
  const [age, setAge]       = useState(currentAge || '');

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '15px', fontWeight: 600,
    outline: 'none', transition: 'border-color 0.25s, box-shadow 0.25s', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        maxWidth: '420px', width: '100%',
        background: 'linear-gradient(145deg, #0a0d1a, #080b16)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #00F5FF, #7C3AED, #FF0080)', backgroundSize: '200% 100%', animation: 'borderSpin 4s linear infinite' }} />

        <div style={{ padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>✏️ Edit Body Info</h2>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>Update your stats — BMI recalculates instantly</p>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', flexShrink: 0, marginTop: '2px',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >✕</button>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '6px' }}>
            {/* Height */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>📏 Height (cm)</label>
              <input
                type="number" min="50" max="300"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="e.g. 170"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            {/* Weight */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>⚖️ Weight (kg)</label>
              <input
                type="number" min="20" max="500"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 70"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            {/* Age */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>🎂 Age (years)</label>
              <input
                type="number" min="1" max="120"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 22"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '10px', marginTop: '4px' }}>{error}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '13px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
            }}>Cancel</button>
            <button
              onClick={() => onSave({ height: Number(height), weight: Number(weight), age: Number(age) })}
              disabled={saving || !height || !weight || !age}
              style={{
                flex: 2, padding: '13px', borderRadius: '10px',
                background: (!saving && height && weight && age) ? 'linear-gradient(135deg, #22d3ee, #818cf8)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                color: (!saving && height && weight && age) ? '#fff' : 'rgba(255,255,255,0.2)',
                fontWeight: 700, fontSize: '14px',
                cursor: (!saving && height && weight && age) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: (!saving && height && weight && age) ? '0 4px 20px rgba(34,211,238,0.25)' : 'none',
              }}
            >
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Username Modal ────────────────────────────────────────────────────
function UsernameModal({ currentName, onSave, onClose, saving, error }) {
  const [val, setVal] = useState(currentName || '');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(18px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '400px', width: '100%',
        background: 'linear-gradient(145deg, #0a0d1a, #080b16)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Top accent */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #22d3ee, #818cf8)' }} />

        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>✏️ Change Username</h2>
              <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>Your display name across FitStart</p>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >✕</button>
          </div>

          <input
            type="text"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSave(val)}
            placeholder="Enter new username..."
            maxLength={30}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: '16px', fontWeight: 600,
              outline: 'none', marginBottom: '8px',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(34,211,238,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            autoFocus
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>Cancel</button>
            <button onClick={() => onSave(val)} disabled={!val.trim() || saving} style={{
              flex: 2, padding: '12px', borderRadius: '10px',
              background: val.trim() && !saving ? 'linear-gradient(135deg, #22d3ee, #818cf8)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: val.trim() && !saving ? '#fff' : 'rgba(255,255,255,0.2)',
              fontWeight: 700, fontSize: '14px',
              cursor: val.trim() && !saving ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: val.trim() && !saving ? '0 4px 20px rgba(34,211,238,0.25)' : 'none',
            }}>
              {saving ? 'Saving...' : '✓ Save Username'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ userInfo, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pfpUrl, setPfpUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Username change modal state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [displayName, setDisplayName] = useState(userInfo?.username || '');
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  // Body stats state (live, mutable via Edit Info modal)
  const [bodyStats, setBodyStats] = useState({
    height: userInfo?.height || 0,
    weight: userInfo?.weight || 0,
    age:    userInfo?.age    || 0,
  });
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [editInfoError, setEditInfoError]       = useState('');
  const [savingBodyStats, setSavingBodyStats]   = useState(false);
  const [bodyStatsSuccess, setBodyStatsSuccess] = useState(false);

  // Journey state
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyStep, setJourneyStep] = useState(1);
  const [workoutPlace, setWorkoutPlace] = useState([]);
  const [streakDays, setStreakDays] = useState('');
  const [daysError, setDaysError] = useState('');

  // Profile menu expanded sections
  const [showDietSubMenu, setShowDietSubMenu] = useState(false);
  const [showWorkoutSubMenu, setShowWorkoutSubMenu] = useState(false);

  const existingJourney = (() => {
    if (userInfo?.journeyData?.totalDays) return userInfo.journeyData;
    try {
      const saved = JSON.parse(localStorage.getItem('fitstart_streak') || 'null');
      if (saved?.totalDays) return saved;
    } catch (_) {}
    return null;
  })();

  const hasJourney = !!existingJourney;

  const toggleWorkoutPlace = (place) => {
    setWorkoutPlace((prev) =>
      prev.includes(place) ? prev.filter((p) => p !== place) : [...prev, place]
    );
  };

  const handleJourneyNext = () => {
    if (workoutPlace.length === 0) return;
    setJourneyStep(2);
  };

  const saveJourneyToServer = async (streakData) => {
    const token = localStorage.getItem('fitstart_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/auth/journey`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(streakData),
      });
    } catch (_) {}
  };

  const handleJourneyStart = async () => {
    const days = parseInt(streakDays, 10);
    if (!days || days < 1 || days > 365) {
      setDaysError('Please enter a number between 1 and 365');
      return;
    }
    setDaysError('');
    const startDate = new Date().toISOString();
    const streakData = { totalDays: days, workoutPlace, completedDays: [], currentStreak: 0, startDate };
    localStorage.setItem('fitstart_streak', JSON.stringify(streakData));
    localStorage.removeItem('fitstart_completed_days');
    // Sync the startDate into the user cache immediately so journeyHelpers work before Day 1 completes
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (!u.journeyData) u.journeyData = {};
      u.journeyData.startDate = startDate;
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch (_) {}
    await saveJourneyToServer(streakData);
    setJourneyOpen(false);
    navigate('/streak', { state: streakData });
  };

  const openJourney = () => {
    if (hasJourney) { navigate('/streak', { state: existingJourney }); return; }
    setJourneyStep(1); setWorkoutPlace([]); setStreakDays(''); setDaysError('');
    setJourneyOpen(true);
  };

  useEffect(() => {
    setDisplayName(userInfo?.username || '');
    setBodyStats({
      height: userInfo?.height || 0,
      weight: userInfo?.weight || 0,
      age:    userInfo?.age    || 0,
    });
  }, [userInfo]);

  const handleSaveBodyStats = async ({ height, weight, age }) => {
    if (!height || !weight || !age) { setEditInfoError('All fields are required'); return; }
    if (height < 50 || height > 300) { setEditInfoError('Height must be between 50–300 cm'); return; }
    if (weight < 10 || weight > 500) { setEditInfoError('Weight must be between 10–500 kg'); return; }
    if (age < 1 || age > 120) { setEditInfoError('Age must be between 1–120 years'); return; }

    setSavingBodyStats(true);
    setEditInfoError('');
    const token = localStorage.getItem('fitstart_token');
    try {
      if (token) {
        const res = await fetch(`${API_BASE}/api/auth/update-body-stats`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ height, weight, age }),
        });
        if (!res.ok) {
          const errData = await res.json();
          setEditInfoError(errData.message || 'Failed to save. Try again.');
          setSavingBodyStats(false);
          return;
        }
      }
      // Sync localStorage
      try {
        const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
        u.height = height; u.weight = weight; u.age = age;
        localStorage.setItem('fitstart_user', JSON.stringify(u));
      } catch (_) {}
      setBodyStats({ height, weight, age });
      setShowEditInfoModal(false);
      setEditInfoError('');
      setBodyStatsSuccess(true);
      setTimeout(() => setBodyStatsSuccess(false), 3000);
    } catch {
      setEditInfoError('Network error. Saved locally only.');
      try {
        const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
        u.height = height; u.weight = weight; u.age = age;
        localStorage.setItem('fitstart_user', JSON.stringify(u));
      } catch (_) {}
      setBodyStats({ height, weight, age });
      setShowEditInfoModal(false);
      setBodyStatsSuccess(true);
      setTimeout(() => setBodyStatsSuccess(false), 3000);
    } finally {
      setSavingBodyStats(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fitstart_token');
    if (!token) return;
    fetch(`${API_BASE}/api/upload/pfp`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.profilePictureUrl) setPfpUrl(`${API_BASE}${data.profilePictureUrl}`);
        else if (userInfo?.profilePicture) setPfpUrl(`${API_BASE}/uploads/${userInfo.profilePicture}`);
      })
      .catch(() => {
        if (userInfo?.profilePicture) setPfpUrl(`${API_BASE}/uploads/${userInfo.profilePicture}`);
      });
  }, [userInfo]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setShowDietSubMenu(false);
        setShowWorkoutSubMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    // Delegate all cleanup to App.js onLogout (calls clearUserLocalData)
    if (onLogout) onLogout();
    navigate('/');
  };

  const handleAddPfp = () => { setDropdownOpen(false); fileInputRef.current?.click(); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem('fitstart_token');
    if (!token) return;
    setUploading(true); setUploadSuccess(false);
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const res = await fetch(`${API_BASE}/api/upload/pfp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.profilePictureUrl) {
        setPfpUrl(`${API_BASE}${data.profilePictureUrl}?t=${Date.now()}`);
        const storedUser = localStorage.getItem('fitstart_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.profilePicture = data.profilePicture;
            localStorage.setItem('fitstart_user', JSON.stringify(parsed));
          } catch (_) {}
        }
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) { console.error('Upload failed:', err); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleSaveUsername = async (newName) => {
    if (!newName.trim()) { setUsernameError('Username cannot be empty'); return; }
    if (newName.trim().length < 2) { setUsernameError('Must be at least 2 characters'); return; }
    setSavingUsername(true);
    setUsernameError('');
    const token = localStorage.getItem('fitstart_token');
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: newName.trim() }),
        });
      }
      // Update localStorage regardless
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      u.username = newName.trim();
      localStorage.setItem('fitstart_user', JSON.stringify(u));
      setDisplayName(newName.trim());
      setShowUsernameModal(false);
      setUsernameError('');
      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (_) {
      // Still update locally
      try {
        const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
        u.username = newName.trim();
        localStorage.setItem('fitstart_user', JSON.stringify(u));
        setDisplayName(newName.trim());
        setShowUsernameModal(false);
        setUsernameSuccess(true);
        setTimeout(() => setUsernameSuccess(false), 3000);
      } catch {}
    } finally {
      setSavingUsername(false);
    }
  };

  // Navigate to diet plan — shows saved plan directly
  const handleShowDietPlan = () => {
    setDropdownOpen(false);
    navigate('/diet');
  };

  // Navigate to diet plan reset — clears saved pref so selection screen shows
  const handleChangeDietPlan = async () => {
    setDropdownOpen(false);
    localStorage.removeItem('fitstart_diet_type');
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (u.preferences) u.preferences.dietType = null;
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch {}
    // Clear on server so next login doesn't restore old plan
    const token = localStorage.getItem('fitstart_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dietType: null }),
        });
      } catch (_) {}
    }
    navigate('/diet');
  };

  // Navigate to workout plan — shows saved plan directly
  const handleShowWorkoutPlan = () => {
    setDropdownOpen(false);
    navigate('/workout');
  };

  // Navigate to workout plan reset — clears saved prefs so setup screen shows
  const handleChangeWorkoutPlan = async () => {
    setDropdownOpen(false);
    localStorage.removeItem('fitstart_workout_plan');
    localStorage.removeItem('fitstart_workout_days');
    try {
      const u = JSON.parse(localStorage.getItem('fitstart_user') || '{}');
      if (u.preferences) { u.preferences.workoutPlanId = null; u.preferences.workoutDays = null; }
      localStorage.setItem('fitstart_user', JSON.stringify(u));
    } catch {}
    // Clear on server so next login doesn't restore old plan
    const token = localStorage.getItem('fitstart_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/preferences`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ workoutPlanId: null, workoutDays: null }),
        });
      } catch (_) {}
    }
    navigate('/workout');
  };

  const bmi = (bodyStats.weight > 0 && bodyStats.height > 0)
    ? (bodyStats.weight / (bodyStats.height / 100) ** 2).toFixed(1)
    : null;

  const getBmiInfo = (bmiVal) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', emoji: '⬇️' };
    if (bmiVal < 25)   return { label: 'Healthy',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  emoji: '✅' };
    if (bmiVal < 30)   return { label: 'Overweight',  color: '#f97316', bg: 'rgba(249,115,22,0.1)',  emoji: '⬆️' };
    return                    { label: 'Obese',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   emoji: '🔴' };
  };

  const bmiInfo = bmi ? getBmiInfo(parseFloat(bmi)) : null;

  // Weight analysis: ideal weight range based on height, BMI 18.5–24.9
  const idealMin = bodyStats.height > 0 ? +(18.5 * (bodyStats.height / 100) ** 2).toFixed(1) : null;
  const idealMax = bodyStats.height > 0 ? +(24.9 * (bodyStats.height / 100) ** 2).toFixed(1) : null;
  const weightDiff = (bodyStats.weight > 0 && idealMin && idealMax)
    ? (() => {
        if (bodyStats.weight < idealMin) return { type: 'gain', kg: +(idealMin - bodyStats.weight).toFixed(1) };
        if (bodyStats.weight > idealMax) return { type: 'lose', kg: +(bodyStats.weight - idealMax).toFixed(1) };
        return { type: 'perfect' };
      })()
    : null;

  const initial = displayName ? displayName[0].toUpperCase() : 'U';

  const journeyProgress = hasJourney
    ? Math.round(((existingJourney.completedDays || []).length / existingJourney.totalDays) * 100)
    : 0;

  // Dropdown menu item style helper
  const menuItemStyle = (hoverBg = 'rgba(255,255,255,0.05)') => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 16px', background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.75)', fontSize: '13px', cursor: 'pointer',
    transition: 'background 0.2s', textAlign: 'left',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #030712 0%, #0a0f1e 50%, #030712 100%)',
        color: '#fff',
        overflowX: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <FloatingOrbs />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Edit Body Info Modal */}
      {showEditInfoModal && (
        <EditInfoModal
          currentHeight={bodyStats.height}
          currentWeight={bodyStats.weight}
          currentAge={bodyStats.age}
          onSave={handleSaveBodyStats}
          onClose={() => { setShowEditInfoModal(false); setEditInfoError(''); }}
          saving={savingBodyStats}
          error={editInfoError}
        />
      )}

      {/* Username Modal */}
      {showUsernameModal && (
        <UsernameModal
          currentName={displayName}
          onSave={handleSaveUsername}
          onClose={() => { setShowUsernameModal(false); setUsernameError(''); }}
          saving={savingUsername}
          error={usernameError}
        />
      )}

      {/* ═══ NAVBAR ═══ */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 2rem',
          height: '70px',
          background: 'rgba(5,5,15,0.82)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(0,240,255,0.08)',
          boxShadow: '0 1px 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 900,
            boxShadow: '0 0 20px rgba(34,211,238,0.4)',
          }}>F</div>
          <span style={{
            fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-1px',
            background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>FITSTART</span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }} ref={dropdownRef}>
          {/* Status badges */}
          {uploadSuccess && (
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, animation: 'fadeIn 0.3s both' }}>✓ Photo updated!</span>
          )}
          {uploading && (
            <span style={{ color: '#22d3ee', fontSize: '12px', fontWeight: 600, animation: 'fadeIn 0.3s both' }}>Uploading...</span>
          )}
          {usernameSuccess && (
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, animation: 'fadeIn 0.3s both' }}>✓ Username updated!</span>
          )}
          {bodyStatsSuccess && (
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, animation: 'fadeIn 0.3s both' }}>✓ Stats saved!</span>
          )}

          {/* ── Blue Profile Circle Button ── */}
          <button
            id="avatar-btn"
            onClick={() => {
              setDropdownOpen(p => !p);
              setShowDietSubMenu(false);
              setShowWorkoutSubMenu(false);
            }}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: pfpUrl ? 'transparent' : 'linear-gradient(135deg, #00b4d8, #7c3aed)',
              border: '2px solid rgba(0,240,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '22px', overflow: 'hidden',
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(0,240,255,0.35), 0 0 40px rgba(0,240,255,0.1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,240,255,0.6), 0 0 60px rgba(0,240,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.35), 0 0 40px rgba(0,240,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.5)'; }}
            aria-label="User menu"
          >
            {pfpUrl
              ? <img src={pfpUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ color: '#fff' }}>{initial}</span>
            }
          </button>

          {/* ── Dropdown Menu ── */}
          {dropdownOpen && (
            <div
              id="avatar-dropdown"
              style={{
                position: 'absolute', top: '60px', right: 0,
                width: '240px',
                background: 'rgba(5,7,20,0.97)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(0,240,255,0.12)',
                borderRadius: '18px',
                boxShadow: '0 24px 70px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,240,255,0.04), 0 0 40px rgba(0,240,255,0.05)',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s both',
                zIndex: 200,
              }}
            >
              {/* User info header */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: pfpUrl ? 'transparent' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    border: '2px solid rgba(59,130,246,0.4)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 900, color: '#fff',
                  }}>
                    {pfpUrl ? <img src={pfpUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '14px', margin: 0 }}>{displayName || 'User'}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', marginBottom: 0 }}>FitStart Member</p>
                  </div>
                </div>
              </div>

              {/* ── Option 1: Change Username ── */}
              <button
                id="change-username-btn"
                onClick={() => { setDropdownOpen(false); setShowUsernameModal(true); }}
                style={menuItemStyle()}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: '16px' }}>✏️</span>
                <span>Change Username</span>
              </button>

              {/* ── Option 2: Upload Photo ── */}
              <button
                id="upload-photo-btn"
                onClick={handleAddPfp}
                style={menuItemStyle()}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ fontSize: '16px' }}>📷</span>
                <span>Upload Photo</span>
              </button>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 12px' }} />

              {/* ── Option 3: Show my Diet Plan ── */}
              <div>
                <button
                  id="show-diet-btn"
                  onClick={() => { setShowDietSubMenu(p => !p); setShowWorkoutSubMenu(false); }}
                  style={{
                    ...menuItemStyle(),
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>🥗</span>
                    <span style={{ color: showDietSubMenu ? '#6ee7b7' : 'rgba(255,255,255,0.75)' }}>Show my Diet Plan</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#4b5563', transform: showDietSubMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                </button>
                {showDietSubMenu && (
                  <div style={{ background: 'rgba(16,185,129,0.04)', borderTop: '1px solid rgba(16,185,129,0.08)' }}>
                    <button
                      onClick={handleShowDietPlan}
                      style={{ ...menuItemStyle(), padding: '9px 16px 9px 36px', fontSize: '12px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>📋</span><span style={{ color: '#6ee7b7' }}>View My Diet Plan</span>
                    </button>
                    <button
                      onClick={handleChangeDietPlan}
                      style={{ ...menuItemStyle(), padding: '9px 16px 9px 36px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>🔄</span><span style={{ color: '#34d399' }}>Change my Diet Plan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── Option 4: Show my Workout Plan ── */}
              <div>
                <button
                  id="show-workout-btn"
                  onClick={() => { setShowWorkoutSubMenu(p => !p); setShowDietSubMenu(false); }}
                  style={{
                    ...menuItemStyle(),
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>🏋️</span>
                    <span style={{ color: showWorkoutSubMenu ? '#c4b5fd' : 'rgba(255,255,255,0.75)' }}>Show my Workout Plan</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#4b5563', transform: showWorkoutSubMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                </button>
                {showWorkoutSubMenu && (
                  <div style={{ background: 'rgba(139,92,246,0.04)', borderTop: '1px solid rgba(139,92,246,0.08)' }}>
                    <button
                      onClick={handleShowWorkoutPlan}
                      style={{ ...menuItemStyle(), padding: '9px 16px 9px 36px', fontSize: '12px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>📋</span><span style={{ color: '#c4b5fd' }}>View My Workout Plan</span>
                    </button>
                    <button
                      onClick={handleChangeWorkoutPlan}
                      style={{ ...menuItemStyle(), padding: '9px 16px 9px 36px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>🔄</span><span style={{ color: '#a78bfa' }}>Change my Workout Plan</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 12px' }} />

              {/* Sign Out */}
              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                style={{ ...menuItemStyle('rgba(239,68,68,0.08)'), color: '#f87171', paddingBottom: '12px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span>🚪</span><span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {/* ── HERO HEADER ── */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '12px 28px', borderRadius: '100px',
            background: 'rgba(0,245,255,0.06)',
            border: '1.5px solid rgba(0,245,255,0.3)',
            marginBottom: '28px',
            fontSize: '16px', fontWeight: 800, color: '#00F5FF',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: '0 0 30px rgba(0,245,255,0.18), inset 0 0 15px rgba(0,245,255,0.05)',
            textShadow: '0 0 12px rgba(0,245,255,0.4)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,245,255,0.55)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(0,245,255,0.3), inset 0 0 25px rgba(0,245,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,245,255,0.18), inset 0 0 15px rgba(0,245,255,0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ display: 'inline-block', animation: 'ping-slow 2s infinite' }}>✦</span>
            <span>Welcome back, {displayName || 'Champion'}</span>
            <span style={{ display: 'inline-block', animation: 'ping-slow 2s infinite' }}>✦</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '1rem',
          }}>
            Choose Your{' '}
            <span style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              backgroundSize: '300% 300%', animation: 'gradientShift 4s ease infinite', display: 'inline-block',
            }}>Path</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
            Your transformation starts with a single decision. Make it today.
          </p>
        </div>

        {/* ── STATS BAR + EDIT INFO BUTTON ── */}
        {userInfo && (
          <div style={{ marginBottom: '2rem' }}>

            {/* ── Section Header Row: title + Edit Info button ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(129,140,248,0.2))',
                  border: '1px solid rgba(34,211,238,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>📊</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '15px', color: '#fff', margin: 0 }}>My Body Stats</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>BMI &amp; health analysis</p>
                </div>
              </div>
              <button
                id="edit-body-info-btn"
                onClick={() => { setShowEditInfoModal(true); setEditInfoError(''); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '11px 22px', borderRadius: '100px',
                  background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15))',
                  border: '1px solid rgba(34,211,238,0.4)',
                  color: '#22d3ee', fontSize: '13px', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.25s',
                  letterSpacing: '0.05em',
                  boxShadow: '0 0 20px rgba(34,211,238,0.1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.28), rgba(129,140,248,0.28))';
                  e.currentTarget.style.boxShadow = '0 0 28px rgba(34,211,238,0.35)';
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15))';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: '15px' }}>✏️</span>
                Edit Info
              </button>
            </div>

            {/* ── Main two-column layout: Stats (left) | Health Analysis (right) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '16px',
              alignItems: 'stretch',
            }}>

              {/* LEFT: stat cards in a 2x2+1 grid */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <StatCard icon="📏" value={`${bodyStats.height} cm`} label="Height" color="#22d3ee" delay={100}
                    bgGrad="linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.02) 100%)" />
                  <StatCard icon="⚖️" value={`${bodyStats.weight} kg`} label="Weight" color="#10b981" delay={200}
                    bgGrad="linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)" />
                  <StatCard icon="🎂" value={`${bodyStats.age} yrs`} label="Age" color="#f59e0b" delay={300}
                    bgGrad="linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <StatCard
                    icon="💡" value={bmi || '—'} label={bmiInfo?.label || 'BMI'}
                    color={bmiInfo?.color || '#6b7280'} delay={400}
                    bgGrad={`linear-gradient(135deg, ${bmiInfo?.bg || 'rgba(255,255,255,0.04)'} 0%, rgba(0,0,0,0) 100%)`}
                  />
                  <StatCard
                    icon={hasJourney && (existingJourney.currentStreak || 0) > 0 ? '🔥' : '📅'}
                    value={
                      hasJourney
                        ? `Day ${(existingJourney.completedDays || []).length + 1}`
                        : '—'
                    }
                    label={
                      hasJourney && (existingJourney.currentStreak || 0) > 0
                        ? `${existingJourney.currentStreak}d Streak 🔥`
                        : hasJourney ? 'Journey Active' : 'No Journey'
                    }
                    color={hasJourney && (existingJourney.currentStreak || 0) > 0 ? '#f59e0b' : '#6b7280'}
                    delay={500}
                    bgGrad={hasJourney && (existingJourney.currentStreak || 0) > 0
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.02) 100%)'
                      : 'rgba(255,255,255,0.02)'}
                  />
                </div>
              </div>

              {/* RIGHT: Health Analysis Panel */}
              <div style={{
                borderRadius: '20px',
                background: bmiInfo
                  ? `linear-gradient(145deg, ${bmiInfo.bg}, rgba(0,0,0,0.3))`
                  : 'rgba(255,255,255,0.03)',
                border: bmiInfo
                  ? `1px solid ${bmiInfo.color}33`
                  : '1px solid rgba(255,255,255,0.08)',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                animation: 'statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.5s both',
                boxShadow: bmiInfo ? `0 0 40px ${bmiInfo.color}10` : 'none',
              }}>
                <p style={{
                  fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0,
                }}>🩺 Health Analysis</p>

                {bmi && bmiInfo && weightDiff ? (
                  <>
                    {/* Weight Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: `${bmiInfo.color}22`,
                        border: `2px solid ${bmiInfo.color}45`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>{bmiInfo.emoji}</div>
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Weight Status</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 900, color: bmiInfo.color, lineHeight: 1.1 }}>{bmiInfo.label}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>BMI {bmi} · Ideal {idealMin}–{idealMax} kg</p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                    {/* Recommendation */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: weightDiff.type === 'perfect' ? 'rgba(16,185,129,0.18)' : weightDiff.type === 'gain' ? 'rgba(251,191,36,0.18)' : 'rgba(249,115,22,0.18)',
                        border: weightDiff.type === 'perfect' ? '2px solid rgba(16,185,129,0.4)' : weightDiff.type === 'gain' ? '2px solid rgba(251,191,36,0.4)' : '2px solid rgba(249,115,22,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {weightDiff.type === 'perfect' ? '🎯' : weightDiff.type === 'gain' ? '🥗' : '🏃'}
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>Recommendation</p>
                        {weightDiff.type === 'perfect' && (
                          <>
                            <p style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981', lineHeight: 1.25 }}>You're at your ideal weight! 🎉</p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', lineHeight: 1.5 }}>Keep it up with balanced diet &amp; exercise.</p>
                          </>
                        )}
                        {weightDiff.type === 'gain' && (
                          <>
                            <p style={{ fontSize: '1rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.25 }}>Gain <span style={{ fontSize: '1.15rem' }}>{weightDiff.kg} kg</span> to reach ideal</p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', lineHeight: 1.5 }}>Increase calorie intake with protein-rich foods.</p>
                          </>
                        )}
                        {weightDiff.type === 'lose' && (
                          <>
                            <p style={{ fontSize: '1rem', fontWeight: 900, color: '#f97316', lineHeight: 1.25 }}>Lose <span style={{ fontSize: '1.15rem' }}>{weightDiff.kg} kg</span> to reach ideal</p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', lineHeight: 1.5 }}>Combine cardio workouts with a calorie deficit.</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* BMI bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Underweight</span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Obese</span>
                      </div>
                      <div style={{ position: 'relative', height: '8px', borderRadius: '99px', background: 'linear-gradient(90deg, #fbbf24 0%, #10b981 30%, #10b981 55%, #f97316 80%, #ef4444 100%)', overflow: 'visible' }}>
                        <div style={{
                          position: 'absolute',
                          left: `${Math.min(Math.max(((parseFloat(bmi) - 10) / 30) * 100, 0), 100)}%`,
                          top: '50%', transform: 'translate(-50%, -50%)',
                          width: '14px', height: '14px', borderRadius: '50%',
                          background: bmiInfo.color,
                          border: '2px solid #fff',
                          boxShadow: `0 0 10px ${bmiInfo.color}`,
                          transition: 'left 0.5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>BMI 10</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>18.5</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>25</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>30</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>40</span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No data placeholder */
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem' }}>📋</div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>No stats yet</p>
                      <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '12px', lineHeight: 1.5 }}>Click <strong style={{ color: '#22d3ee' }}>Edit Info</strong> above to add your height, weight &amp; age for instant BMI analysis.</p>
                    </div>
                    <button
                      onClick={() => { setShowEditInfoModal(true); setEditInfoError(''); }}
                      style={{
                        padding: '9px 20px', borderRadius: '100px',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15))',
                        border: '1px solid rgba(34,211,238,0.35)',
                        color: '#22d3ee', fontSize: '12px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,238,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.15))'}
                    >✏️ Add My Stats</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── OPTION CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
          {options.map((opt, i) => (
            <button
              key={opt.id}
              id={`card-${opt.id}`}
              onClick={() => navigate(opt.route)}
              onMouseEnter={() => setHoveredCard(opt.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: 'relative', textAlign: 'left',
                padding: '0', background: 'none', border: 'none',
                cursor: 'pointer', borderRadius: '24px', overflow: 'hidden',
                animation: `cardReveal 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 0.15 + 0.1}s both`,
                transform: hoveredCard === opt.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: hoveredCard === opt.id
                  ? `0 30px 80px ${opt.bgGlow.replace('0.12', '0.25')}, 0 0 0 1px ${opt.borderColor}`
                  : `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${opt.borderColor}`,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(10,12,25,0.95) 0%, rgba(5,8,18,0.98) 100%)', borderRadius: '24px', transition: 'all 0.4s' }} />
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 20% 30%, ${opt.bgGlow.replace('0.12', hoveredCard === opt.id ? '0.25' : '0.08')} 0%, transparent 70%)`, borderRadius: '24px', transition: 'all 0.4s' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: opt.gradient, opacity: hoveredCard === opt.id ? 1 : 0.5, transition: 'opacity 0.4s' }} />
              <div style={{ position: 'absolute', top: '20px', right: '24px', fontSize: '4rem', fontWeight: 900, lineHeight: 1, color: hoveredCard === opt.id ? `${opt.accent}15` : 'rgba(255,255,255,0.04)', fontFamily: "'Outfit', sans-serif", userSelect: 'none', transition: 'color 0.4s' }}>
                {opt.number}
              </div>
              <div style={{ position: 'relative', padding: '2rem' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: opt.bgGlow.replace('0.12', '0.2'),
                  border: `1px solid ${opt.borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', marginBottom: '1.2rem', transition: 'all 0.4s',
                  ...(hoveredCard === opt.id && {
                    background: opt.gradient, border: 'none',
                    boxShadow: `0 10px 30px ${opt.bgGlow.replace('0.12', '0.4')}`,
                    transform: 'scale(1.1) rotate(-5deg)',
                  }),
                }}>{opt.icon}</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.2, color: hoveredCard === opt.id ? '#fff' : 'rgba(255,255,255,0.9)', transition: 'color 0.3s' }}>
                  {opt.title}
                </h2>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: hoveredCard === opt.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', transition: 'color 0.3s' }}>
                  {opt.subtitle}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                  {opt.tags.map((tag) => (
                    <span key={tag} style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: opt.tagColor, border: `1px solid ${opt.tagBorder}`, color: opt.tagText, letterSpacing: '0.02em', transition: 'all 0.3s' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: opt.accent, opacity: hoveredCard === opt.id ? 1 : 0, transform: hoveredCard === opt.id ? 'translateX(0)' : 'translateX(-10px)', transition: 'all 0.3s' }}>
                    Tap to explore →
                  </span>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: hoveredCard === opt.id ? opt.gradient : `${opt.bgGlow}`,
                    border: `2px solid ${opt.borderColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', transition: 'all 0.4s',
                    transform: hoveredCard === opt.id ? 'scale(1.15) rotate(45deg)' : 'scale(1) rotate(0deg)',
                    boxShadow: hoveredCard === opt.id ? `0 8px 25px ${opt.bgGlow.replace('0.12', '0.5')}` : 'none',
                  }}>→</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── JOURNEY CTA SECTION ── */}
        <div className="animate-fade-in delay-500" style={{ borderRadius: '28px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(236,72,153,0.08) 100%)', borderRadius: '28px' }} />
          <div style={{ position: 'relative', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', backdropFilter: 'blur(10px)' }}>
            {hasJourney ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#22d3ee', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>🔥 Journey In Progress</p>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                    Day {(existingJourney.completedDays || []).length + 1} of {existingJourney.totalDays}
                  </h3>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#22d3ee' }}>{journeyProgress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div className="progress-animate" style={{ height: '100%', width: `${journeyProgress}%`, borderRadius: '100px', background: 'linear-gradient(90deg, #22d3ee, #818cf8, #ec4899)', boxShadow: '0 0 12px rgba(34,211,238,0.5)' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Days Done', value: (existingJourney.completedDays || []).length, color: '#22d3ee', icon: '✅' },
                    { label: 'Streak', value: `${existingJourney.currentStreak || 0} 🔥`, color: '#f59e0b', icon: '⚡' },
                    { label: 'Total Days', value: existingJourney.totalDays, color: '#10b981', icon: '🎯' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <button
                  id="journey-cta-btn"
                  onClick={openJourney}
                  style={{
                    width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                    background: 'linear-gradient(135deg, #22d3ee, #818cf8, #ec4899)',
                    backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite',
                    color: '#fff', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(34,211,238,0.3)', transition: 'transform 0.3s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>🔥</span><span>Continue My Journey</span><span>💪</span>
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Ready to commit?</p>
                  <h3 style={{ fontSize: '1.7rem', fontWeight: 900, background: 'linear-gradient(135deg, #22d3ee, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                    Start Your Journey Today
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
                    Set your goal · Track your streak · Reach the finish line
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.8rem' }}>
                  {[
                    { text: '🎯 Custom Duration', color: '#22d3ee' },
                    { text: '🏋️ Location-Based', color: '#10b981' },
                    { text: '🔥 Daily Streaks', color: '#f59e0b' },
                    { text: '📊 Progress Tracking', color: '#ec4899' },
                  ].map((pill) => (
                    <span key={pill.text} style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, background: `${pill.color}15`, border: `1px solid ${pill.color}30`, color: pill.color }}>
                      {pill.text}
                    </span>
                  ))}
                </div>
                <button
                  id="journey-cta-btn"
                  onClick={openJourney}
                  style={{
                    padding: '18px 48px', borderRadius: '16px', border: 'none',
                    background: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #ec4899 100%)',
                    backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite',
                    color: '#fff', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer',
                    boxShadow: '0 12px 40px rgba(34,211,238,0.35)', transition: 'transform 0.3s',
                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>🚀</span><span>Let's Build Yourself</span><span>💪</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ JOURNEY SETUP MODAL ═══ */}
      {journeyOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          padding: '1rem',
        }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: '440px',
            background: 'linear-gradient(145deg, #0a0d1a, #080b16)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden', animation: 'fadeInUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{ display: 'flex', height: '3px' }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ flex: 1, background: journeyStep >= s ? 'linear-gradient(90deg, #22d3ee, #818cf8)' : 'rgba(255,255,255,0.06)', transition: 'background 0.5s' }} />
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              <button onClick={() => setJourneyOpen(false)} style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >✕</button>

              {journeyStep === 1 && (
                <div>
                  {/* Step header */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Step 1 of 2</span>
                      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(34,211,238,0.3), transparent)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.7rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.5px' }}>Where will you train?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13.5px', lineHeight: 1.5 }}>
                      Select all that apply — we'll tailor your workout plan to your location.
                    </p>
                  </div>

                  {/* Place cards — large glassmorphism selection */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'At Home', emoji: '🏠', desc: 'Bodyweight\n& resistance', color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
                      { label: 'At Gym',  emoji: '🏋️', desc: 'Full machine\naccess',    color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)' },
                    ].map(({ label, emoji, desc, color, glow }) => {
                      const sel = workoutPlace.includes(label);
                      return (
                        <button
                          key={label}
                          onClick={() => toggleWorkoutPlace(label)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '10px',
                            padding: '22px 16px', borderRadius: '18px', textAlign: 'center',
                            border: `2px solid ${sel ? color : 'rgba(255,255,255,0.08)'}`,
                            background: sel ? `${color}12` : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                            boxShadow: sel ? `0 0 30px ${glow}, inset 0 0 20px ${color}08` : 'none',
                            transform: sel ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Selection tick */}
                          {sel && (
                            <div style={{
                              position: 'absolute', top: '10px', right: '10px',
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', color: '#fff', fontWeight: 900,
                              animation: 'statPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
                            }}>✓</div>
                          )}
                          <span style={{
                            fontSize: '2.6rem', lineHeight: 1,
                            filter: sel ? `drop-shadow(0 0 12px ${color})` : 'none',
                            transition: 'filter 0.3s',
                          }}>{emoji}</span>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: '14px', color: sel ? '#fff' : 'rgba(255,255,255,0.75)', marginBottom: '3px' }}>{label}</p>
                            <p style={{ fontSize: '11px', color: sel ? `${color}` : 'rgba(255,255,255,0.3)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Both selected indicator */}
                  {workoutPlace.length === 2 && (
                    <div style={{
                      padding: '10px 14px', borderRadius: '12px', marginBottom: '14px',
                      background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)',
                      textAlign: 'center', animation: 'fadeIn 0.3s ease',
                    }}>
                      <p style={{ color: '#22d3ee', fontSize: '12px', fontWeight: 700 }}>
                        ✨ Hybrid training — plans will include both home & gym workouts!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleJourneyNext}
                    disabled={workoutPlace.length === 0}
                    className="btn-primary"
                    style={{
                      width: '100%', padding: '15px', borderRadius: '14px',
                      fontSize: '15px', fontWeight: 800,
                      opacity: workoutPlace.length === 0 ? 0.4 : 1,
                      cursor: workoutPlace.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Continue → {workoutPlace.length > 0 && `(${workoutPlace.join(' & ')})`}
                  </button>
                </div>
              )}

              {journeyStep === 2 && (
                <div>
                  <button onClick={() => setJourneyStep(1)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                    fontSize: '13px', cursor: 'pointer', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '6px', padding: 0, transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                  >← Back</button>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Step 2 of 2</p>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px' }}>Set Your Target</h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '1.2rem' }}>
                    Training at: <span style={{ color: '#22d3ee', fontWeight: 700 }}>{workoutPlace.join(' & ')}</span>
                    <br />Your plans will auto-scale to match your duration.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    {[
                      { d: 30, label: '30 Days', sub: '4 weeks · Starter', emoji: '🌱', color: '#10b981' },
                      { d: 60, label: '60 Days', sub: '9 weeks · Committed', emoji: '💪', color: '#22d3ee' },
                      { d: 90, label: '90 Days', sub: '13 weeks · Dedicated', emoji: '🔥', color: '#f59e0b' },
                      { d: 180, label: '180 Days', sub: '26 weeks · Elite', emoji: '🏆', color: '#ec4899' },
                    ].map(({ d, label, sub, emoji, color }) => (
                      <button key={d} onClick={() => { setStreakDays(String(d)); setDaysError(''); }} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px', borderRadius: '14px', textAlign: 'left',
                        border: `2px solid ${streakDays === String(d) ? color : 'rgba(255,255,255,0.07)'}`,
                        background: streakDays === String(d) ? `${color}15` : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.25s',
                        boxShadow: streakDays === String(d) ? `0 0 20px ${color}25` : 'none',
                      }}>
                        <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                        <div>
                          <p style={{ fontWeight: 900, fontSize: '13px', color: streakDays === String(d) ? '#fff' : 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>{label}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>{sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Custom days input */}
                  <div style={{ position: 'relative', marginBottom: '4px' }}>
                    <input
                      type="number" min="1" max="365"
                      value={streakDays}
                      onChange={(e) => { setStreakDays(e.target.value); setDaysError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleJourneyStart()}
                      placeholder="——"
                      className="input-number-display"
                      style={{ boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,240,255,0.6)'; e.target.style.boxShadow = '0 0 0 4px rgba(0,240,255,0.08), 0 0 30px rgba(0,240,255,0.15)'; }}
                      onBlur={e  => { e.target.style.borderColor = 'rgba(0,240,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <span style={{
                      position: 'absolute', right: '18px', bottom: '16px',
                      fontSize: '12px', fontWeight: 700, color: 'rgba(0,240,255,0.4)',
                      pointerEvents: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>days</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: '4px' }}>Enter 1–365 or pick a preset above</p>
                  {daysError && <p style={{ color: '#f87171', fontSize: '12px', textAlign: 'center', marginBottom: '8px' }}>{daysError}</p>}
                  {streakDays && parseInt(streakDays) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px', margin: '10px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                      {[
                        { val: streakDays, label: 'Days', color: '#22d3ee' },
                        { val: Math.ceil(parseInt(streakDays) / 7), label: 'Weeks', color: '#10b981' },
                        { val: Math.ceil(parseInt(streakDays) / 7) * 7, label: 'Plan Days', color: '#a78bfa' },
                      ].map((item, idx) => (
                        <React.Fragment key={item.label}>
                          {idx > 0 && <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.07)' }} />}
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 900, color: item.color }}>{item.val}</p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</p>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  <button onClick={handleJourneyStart} disabled={!streakDays} style={{
                    width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                    background: streakDays ? 'linear-gradient(135deg, #22d3ee, #818cf8)' : 'rgba(255,255,255,0.05)',
                    color: streakDays ? '#fff' : 'rgba(255,255,255,0.2)',
                    fontWeight: 700, fontSize: '15px', cursor: streakDays ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s', marginTop: '6px',
                    boxShadow: streakDays ? '0 8px 25px rgba(34,211,238,0.3)' : 'none',
                  }}
                    onMouseEnter={e => { if (streakDays) e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🚀 Start My {streakDays || '?'}-Day Journey!
                  </button>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '8px' }}>
                    Your plans will auto-expand to {streakDays ? Math.ceil(parseInt(streakDays) / 7) : '?'} weeks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
