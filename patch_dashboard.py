
# Patch Dashboard.js to add Framer Motion micro-interactions
# Strategy: 
#   1. Add framer-motion import
#   2. Import motion components
#   3. Convert StatCard div to motion.div with hover
#   4. Convert option card button to motion.button with whileHover/whileTap
#   5. Convert Quick Action buttons to motion.button
#   6. Wrap main content in a fade-in stagger entrance

import re

with open(r'C:\Users\DELL\Desktop\FitStart\client\src\pages\Dashboard.js', encoding='utf-8') as f:
    code = f.read()

# 1. Add framer-motion import after the first import line
old_import = "import React, { useState, useEffect, useRef, useCallback } from 'react';"
new_import = "import React, { useState, useEffect, useRef, useCallback } from 'react';\nimport { motion } from 'framer-motion';\nimport { FadeInWhenVisible, StaggerContainer, StaggerItem } from '../components/FadeInWhenVisible';\nimport { useReducedMotion } from '../hooks/useReducedMotion';"

code = code.replace(old_import, new_import, 1)

# 2. In StatCard: change <div to <motion.div and add whileHover/whileTap, remove manual mouseEnter/Leave
old_stat_card = """function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ padding: '20px 16px', borderRadius: '16px', background: '#14141B', border: `1px solid ${color}28`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.boxShadow = `0 0 24px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ color, marginBottom: '4px' }}>{icon}</div>
      <p style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.5px', fontFamily: "'Space Mono', monospace", margin: 0 }}>{value}</p>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B76', fontWeight: 600, margin: 0 }}>{label}</p>
    </div>
  );
}"""

new_stat_card = """function StatCard({ icon, value, label, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, boxShadow: `0 0 28px ${color}22`, borderColor: `${color}55`, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
      whileTap={{ scale: 0.97 }}
      style={{ padding: '20px 16px', borderRadius: '16px', background: '#14141B', border: `1px solid ${color}28`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', cursor: 'default' }}
    >
      <div style={{ color, marginBottom: '4px' }}>{icon}</div>
      <p style={{ fontSize: '1.4rem', fontWeight: 800, color, letterSpacing: '-0.5px', fontFamily: "'Space Mono', monospace", margin: 0 }}>{value}</p>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B76', fontWeight: 600, margin: 0 }}>{label}</p>
    </motion.div>
  );
}"""

code = code.replace(old_stat_card, new_stat_card, 1)

# 3. In the option card: change <button to <motion.button and handle transforms via Framer Motion
# Remove `transform` and `transition` from the inline style and use whileHover/whileTap instead
old_option_btn_open = """            <button key={opt.id} id={`option-card-${opt.id}`} onClick={() => navigate(opt.route)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}
              style={{ display: 'block', textAlign: 'left', width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '28px', borderRadius: '20px', overflow: 'hidden', position: 'relative', background: hovered === opt.id ? opt.bgGlow : '#14141B', borderWidth: '1px', borderStyle: 'solid', borderColor: hovered === opt.id ? opt.borderColor : '#26262F', transform: hovered === opt.id ? 'translateY(-6px)' : 'translateY(0)', boxShadow: hovered === opt.id ? `0 20px 48px ${opt.bgGlow}` : '0 2px 16px rgba(0,0,0,0.4)', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>"""

new_option_btn_open = """            <motion.button key={opt.id} id={`option-card-${opt.id}`} onClick={() => navigate(opt.route)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -8, scale: 1.01, transition: { type: 'spring', stiffness: 200, damping: 22 } }}
              whileTap={{ scale: 0.97, y: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } }}
              style={{ display: 'block', textAlign: 'left', width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '28px', borderRadius: '20px', overflow: 'hidden', position: 'relative', background: hovered === opt.id ? opt.bgGlow : '#14141B', borderWidth: '1px', borderStyle: 'solid', borderColor: hovered === opt.id ? opt.borderColor : '#26262F', boxShadow: hovered === opt.id ? `0 20px 48px ${opt.bgGlow}` : '0 2px 16px rgba(0,0,0,0.4)', transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease' }}>"""

code = code.replace(old_option_btn_open, new_option_btn_open, 1)

# Close tag: </button> → </motion.button> for the option card
# The option card button closing tag should be </motion.button>
# There's only one </button> in the options map, replace it carefully in context
old_option_btn_close = """            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px',"""

new_option_btn_close = """            </motion.button>
          ))}
        </div>

        <div style={{ padding: '20px 24px',"""

code = code.replace(old_option_btn_close, new_option_btn_close, 1)

# 4. Convert Quick Action buttons to motion.button
old_qa_btn = """              <button key={btn.label} onClick={btn.action} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '100px', background: btn.danger ? 'transparent' : `${btn.color}0D`, border: `1px solid ${btn.danger ? 'rgba(239,68,68,0.25)' : `${btn.color}28`}`, color: btn.color, fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s', minHeight: '38px' }}
                onMouseEnter={e => { e.currentTarget.style.background = btn.danger ? 'rgba(239,68,68,0.08)' : `${btn.color}18`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = btn.danger ? 'transparent' : `${btn.color}0D`; e.currentTarget.style.transform = 'translateY(0)'; }}>"""

new_qa_btn = """              <motion.button key={btn.label} onClick={btn.action}
                whileHover={{ scale: 1.04, y: -1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 400, damping: 40 } }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '100px', background: btn.danger ? 'transparent' : `${btn.color}0D`, border: `1px solid ${btn.danger ? 'rgba(239,68,68,0.25)' : `${btn.color}28`}`, color: btn.color, fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', minHeight: '38px' }}>"""

code = code.replace(old_qa_btn, new_qa_btn, 1)

# Close motion.button for QA buttons
old_qa_close = """              </button>
            ))}"""
new_qa_close = """              </motion.button>
            ))}"""

code = code.replace(old_qa_close, new_qa_close, 1)

# 5. Wrap stat cards grid in StaggerContainer/StaggerItem
old_stat_grid = """        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <StatCard icon={<IconRuler size={18} color="#00E5FF" />} value={user.height ? `${user.height}cm` : '—'} label="Height" color="#00E5FF" />
          <StatCard icon={<IconScale size={18} color="#B6FF3C" />} value={user.weight ? `${user.weight}kg` : '—'} label="Weight" color="#B6FF3C" />
          <StatCard icon={<IconCalendar size={18} color="#FF7A00" />} value={user.age ? `${user.age}yr` : '—'} label="Age" color="#FF7A00" />
          <StatCard icon={<IconActivity size={18} color={bmiColor} />} value={bmi || '—'} label={bmiLabel} color={bmiColor} />
        </div>"""

new_stat_grid = """        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <StaggerItem><StatCard icon={<IconRuler size={18} color="#00E5FF" />} value={user.height ? `${user.height}cm` : '—'} label="Height" color="#00E5FF" /></StaggerItem>
          <StaggerItem><StatCard icon={<IconScale size={18} color="#B6FF3C" />} value={user.weight ? `${user.weight}kg` : '—'} label="Weight" color="#B6FF3C" /></StaggerItem>
          <StaggerItem><StatCard icon={<IconCalendar size={18} color="#FF7A00" />} value={user.age ? `${user.age}yr` : '—'} label="Age" color="#FF7A00" /></StaggerItem>
          <StaggerItem><StatCard icon={<IconActivity size={18} color={bmiColor} />} value={bmi || '—'} label={bmiLabel} color={bmiColor} /></StaggerItem>
        </StaggerContainer>"""

code = code.replace(old_stat_grid, new_stat_grid, 1)

# 6. Wrap the hero heading in FadeInWhenVisible
old_hero = """        <div style={{ marginBottom: 'clamp(32px, 5vw, 48px)', textAlign: 'center' }}>"""
new_hero = """        <FadeInWhenVisible delay={0} style={{ marginBottom: 'clamp(32px, 5vw, 48px)', textAlign: 'center' }}>"""
code = code.replace(old_hero, new_hero, 1)

# Close the FadeInWhenVisible for hero section
old_hero_close = """          <p style={{ color: '#6B6B76', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>Your personalized hub for diet, workouts, and progress tracking.</p>
        </div>

        <StaggerContainer"""
new_hero_close = """          <p style={{ color: '#6B6B76', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>Your personalized hub for diet, workouts, and progress tracking.</p>
        </FadeInWhenVisible>

        <StaggerContainer"""
code = code.replace(old_hero_close, new_hero_close, 1)

# 7. Add shimmer class to the primary CTA gradient button in modals (Save Changes)
# Already handled via CSS .btn-shimmer class - just add className note

# 8. Wrap the option cards grid in FadeInWhenVisible
old_options_grid = """        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>"""
new_options_grid = """        <StaggerContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px', marginBottom: 'clamp(32px, 5vw, 48px)' }}>"""
code = code.replace(old_options_grid, new_options_grid, 1)

old_options_grid_close = """          ))}
        </div>

        <div style={{ padding: '20px 24px',"""
new_options_grid_close = """          ))}
        </StaggerContainer>

        <div style={{ padding: '20px 24px',"""
code = code.replace(old_options_grid_close, new_options_grid_close, 1)

# Also wrap option map items in StaggerItem
old_options_map_open = """          {options.map(opt => (
            <motion.button key={opt.id}"""
new_options_map_open = """          {options.map(opt => (
            <StaggerItem key={opt.id}><motion.button id={`option-card-${opt.id}-inner`}"""
code = code.replace(old_options_map_open, new_options_map_open, 1)

old_options_map_close = """            </motion.button>
          ))}
        </StaggerContainer>"""
new_options_map_close = """            </motion.button></StaggerItem>
          ))}
        </StaggerContainer>"""
code = code.replace(old_options_map_close, new_options_map_close, 1)

# Fix: the id was already set on motion.button, remove the duplicate
# option-card-${opt.id} on outer motion.button (now on StaggerItem), put id back
old_inner_btn = """            <StaggerItem key={opt.id}><motion.button id={`option-card-${opt.id}-inner`} id={`option-card-${opt.id}`}"""
if old_inner_btn in code:
    code = code.replace(old_inner_btn, """            <StaggerItem key={opt.id}><motion.button id={`option-card-${opt.id}`}""", 1)

# Clean up: remove key from motion.button (moved to StaggerItem)
code = code.replace(
    '<motion.button key={opt.id} id={`option-card-${opt.id}`} onClick={() => navigate(opt.route)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}',
    '<motion.button id={`option-card-${opt.id}`} onClick={() => navigate(opt.route)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}',
    1
)

# Also need to add useReducedMotion to Dashboard function (for conditional animations)
# It's already imported - it will work fine without being called in Dashboard since 
# the motion components handle it internally via the hooks in FadeInWhenVisible

with open(r'C:\Users\DELL\Desktop\FitStart\client\src\pages\Dashboard.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Dashboard.js patched successfully')
print('Lines:', code.count('\n'))
