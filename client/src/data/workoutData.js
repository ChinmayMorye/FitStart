// ── Shared workout constants ──────────────────────────────────────────────────
// Extracted from WorkoutPage so StreakPage can also use them for the
// in-modal workout verification step.

export const ALL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// Day name → 0-based index (Mon=0 … Sun=6)
export const DAY_INDEX = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
};

// Spread n workout slots evenly across 7 days, always skipping the restDayIdx.
// restDayIdx: 0-6 (Mon-Sun). Default 6 = Sunday.
export function buildSlots(n, restDayIdx = 6) {
  // Available indices = all days except the rest day
  const available = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== restDayIdx);
  const cap = Math.min(n, available.length); // can't have more workout days than available days

  // Evenly space the workout slots across the available days
  const spacing = available.length / cap;
  const slots = [];
  for (let i = 0; i < cap; i++) {
    slots.push(available[Math.round(i * spacing)]);
  }
  slots.sort((a, b) => a - b);
  return slots;
}

export const REST_CARDS = [
  { emoji:'🧘', type:'Yoga & Stretch',       color:'#a78bfa', tips:['10 min morning yoga','Hip flexor stretch','Cat-cow pose','Box breathing'] },
  { emoji:'🚶', type:'Active Recovery',       color:'#34d399', tips:['30 min brisk walk','Foam roll muscles','Mobility drills','Contrast shower'] },
  { emoji:'🚴', type:'Cardio Day',            color:'#22d3ee', tips:['20-30 min cycling','Zone 2 heart rate','Incline treadmill','Skip rope 3×1 min'] },
  { emoji:'💧', type:'Recovery & Nutrition',  color:'#60a5fa', tips:['Drink 3L water','Sleep 7-9 hrs','Anti-inflammatory food','Limit sugar'] },
  { emoji:'😴', type:'Full Rest Day',         color:'#9ca3af', tips:['No training today','Light walk optional','Focus on protein','Visualise tomorrow'] },
  { emoji:'🏊', type:'Swim / Water Walk',     color:'#38bdf8', tips:['20 min pool swim','Joint-friendly cardio','Breathing rhythm','Float cool-down'] },
  { emoji:'🌿', type:'Mind & Body Day',       color:'#86efac', tips:['Meditate 10-15 min','Journal goals','Nature walk','Limit screens before bed'] },
];

export const COLORS = {
  cyan:   { border:'border-cyan-500/30',   text:'text-cyan-400',   grad:'from-cyan-500 to-blue-600',   badge:'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',   glow:'shadow-cyan-500/20' },
  purple: { border:'border-purple-500/30', text:'text-purple-400', grad:'from-purple-500 to-blue-600',  badge:'bg-purple-500/10 border-purple-500/20 text-purple-400', glow:'shadow-purple-500/20' },
  blue:   { border:'border-blue-500/30',   text:'text-blue-400',   grad:'from-blue-500 to-indigo-600',  badge:'bg-blue-500/10 border-blue-500/20 text-blue-400',   glow:'shadow-blue-500/20' },
  orange: { border:'border-orange-500/30', text:'text-orange-400', grad:'from-orange-500 to-red-500',   badge:'bg-orange-500/10 border-orange-500/20 text-orange-400', glow:'shadow-orange-500/20' },
  red:    { border:'border-red-500/30',    text:'text-red-400',    grad:'from-red-500 to-orange-500',   badge:'bg-red-500/10 border-red-500/20 text-red-400',     glow:'shadow-red-500/20' },
};

export const SPLITS = {
  1:{ label:'Full Body', plans:[
    { id:'A', name:'Plan A — Full Body Power',       accentColor:'cyan',   tagline:'Compound-focused, max output',       days:[{ label:'Full Body',     emoji:'💥', focus:'Squat + Push + Pull',               muscles:['Chest','Back','Legs','Shoulders','Arms'] }] },
    { id:'B', name:'Plan B — Full Body Hypertrophy', accentColor:'purple', tagline:'Volume-based for muscle growth',      days:[{ label:'Full Body',     emoji:'🔥', focus:'Higher Reps · Isolation + Compound',  muscles:['Chest','Back','Legs','Core','Arms'] }] },
  ]},
  2:{ label:'Upper / Lower', plans:[
    { id:'A', name:'Plan A — Upper/Lower Classic',   accentColor:'cyan',   tagline:'Balanced push & pull with leg day',  days:[{ label:'Upper Body',    emoji:'💪', focus:'Chest · Back · Shoulders · Arms',    muscles:['Chest','Back','Shoulders','Biceps','Triceps'] },{ label:'Lower Body',    emoji:'🦵', focus:'Quads · Hamstrings · Glutes',       muscles:['Quads','Hamstrings','Glutes','Calves','Core'] }] },
    { id:'B', name:'Plan B — Upper/Lower Strength',  accentColor:'purple', tagline:'Heavy compound lifts',               days:[{ label:'Upper Strength', emoji:'🏋️', focus:'Bench · Row · OHP · Pull-ups',       muscles:['Chest','Back','Shoulders','Core'] },{ label:'Lower Strength', emoji:'⚡', focus:'Squat · Deadlift · Lunges',          muscles:['Quads','Hamstrings','Glutes','Erectors'] }] },
  ]},
  3:{ label:'Push / Pull / Legs', plans:[
    { id:'A', name:'Plan A — PPL Hypertrophy', accentColor:'cyan', tagline:'Classic 3-day PPL', days:[{ label:'Push', emoji:'🤜', focus:'Chest · Shoulders · Triceps', muscles:['Chest','Front Deltoid','Side Deltoid','Triceps'] },{ label:'Pull', emoji:'🤛', focus:'Back · Biceps · Rear Delts', muscles:['Lats','Rhomboids','Biceps','Rear Deltoid'] },{ label:'Legs', emoji:'🦵', focus:'Quads · Hamstrings · Glutes', muscles:['Quads','Hamstrings','Glutes','Calves','Core'] }] },
    { id:'B', name:'Plan B — PPL Strength',    accentColor:'blue', tagline:'Heavy compounds each day', days:[{ label:'Push Heavy', emoji:'💥', focus:'Bench · OHP · Dips', muscles:['Chest','Shoulders','Triceps'] },{ label:'Pull Heavy', emoji:'⚙️', focus:'Deadlift · Rows · Pull-ups', muscles:['Back','Biceps','Rear Delts'] },{ label:'Legs Heavy', emoji:'🔩', focus:'Squat · RDL · Leg Press', muscles:['Quads','Hamstrings','Glutes'] }] },
  ]},
  4:{ label:'4-Day Split', plans:[
    { id:'A', name:'Plan A — Upper/Lower x2', accentColor:'cyan',   tagline:'Twice-weekly per muscle', days:[{ label:'Upper A', emoji:'🌟', focus:'Chest · Back Horizontal', muscles:['Chest','Lats','Rear Delts','Biceps','Triceps'] },{ label:'Lower A', emoji:'🦵', focus:'Quad-dominant · Core', muscles:['Quads','Glutes','Calves','Core'] },{ label:'Upper B', emoji:'💪', focus:'Shoulders · Back Vertical', muscles:['Shoulders','Traps','Lats','Biceps','Triceps'] },{ label:'Lower B', emoji:'⚡', focus:'Hamstring-dominant · Glutes', muscles:['Hamstrings','Glutes','Calves','Erectors'] }] },
    { id:'B', name:'Plan B — Body Part Split', accentColor:'orange', tagline:'Dedicated day per muscle', days:[{ label:'Chest & Triceps', emoji:'🤜', focus:'Bench · Flyes · Triceps', muscles:['Chest','Triceps','Front Deltoid'] },{ label:'Back & Biceps', emoji:'🤛', focus:'Rows · Pull-ups · Curls', muscles:['Lats','Rhomboids','Biceps','Rear Delts'] },{ label:'Shoulders', emoji:'🏔️', focus:'OHP · Raises · Shrugs', muscles:['Front Delt','Lateral Delt','Rear Delt','Traps'] },{ label:'Legs', emoji:'🦵', focus:'Squat · RDL · Leg Press', muscles:['Quads','Hamstrings','Glutes','Calves'] }] },
  ]},
  5:{ label:'5-Day Bro Split', plans:[
    { id:'A', name:'Plan A — Classic Bro Split',      accentColor:'cyan',   tagline:'One muscle group, max volume', days:[{ label:'Chest Day',    emoji:'🤜', focus:'Bench · Incline · Flyes · Dips',          muscles:['Upper Chest','Mid Chest','Lower Chest','Front Delts','Triceps'] },{ label:'Back Day',     emoji:'🤛', focus:'Deadlift · Pull-ups · Rows',             muscles:['Lats','Rhomboids','Traps','Rear Delts','Biceps'] },{ label:'Legs Day',    emoji:'🦵', focus:'Squat · Leg Press · RDL · Calves',        muscles:['Quads','Hamstrings','Glutes','Calves','Core'] },{ label:'Shoulder Day', emoji:'🏔️', focus:'OHP · Lateral · Front Raises · Shrugs', muscles:['Front Delt','Lateral Delt','Rear Delt','Traps'] },{ label:'Arms Day',    emoji:'💪', focus:'Curl · Skull Crusher · Hammer · Pushdown', muscles:['Biceps','Triceps','Forearms'] }] },
    { id:'B', name:'Plan B — PPL + Full Body Hybrid', accentColor:'purple', tagline:'Push/Pull/Legs + bonus days', days:[{ label:'Push',          emoji:'🤜', focus:'Chest · Shoulders · Triceps Heavy',      muscles:['Chest','Shoulders','Triceps'] },{ label:'Pull',          emoji:'🤛', focus:'Back · Biceps · Rear Delts Heavy',        muscles:['Lats','Rhomboids','Biceps','Rear Delts'] },{ label:'Legs',          emoji:'🦵', focus:'Squat-focused · Glutes · Calves',          muscles:['Quads','Glutes','Calves','Core'] },{ label:'Upper Light',   emoji:'⚡', focus:'Volume · Isolation focus',                 muscles:['Chest','Back','Shoulders','Arms'] },{ label:'Lower + Core',  emoji:'🔥', focus:'Deadlift-focused · Hamstrings · Abs',      muscles:['Hamstrings','Glutes','Erectors','Core'] }] },
  ]},
  6:{ label:'PPL x2', plans:[
    { id:'A', name:'Plan A — PPL x2 Volume',   accentColor:'cyan', tagline:'High frequency, high volume', days:[{ label:'Push A', emoji:'🤜', focus:'Chest heavy · Shoulders · Triceps', muscles:['Chest','Shoulders','Triceps'] },{ label:'Pull A', emoji:'🤛', focus:'Back heavy · Biceps', muscles:['Lats','Rhomboids','Biceps','Rear Delts'] },{ label:'Legs A', emoji:'🦵', focus:'Squat-focused · Calves', muscles:['Quads','Glutes','Calves'] },{ label:'Push B', emoji:'💥', focus:'Shoulders heavy · Chest volume', muscles:['Shoulders','Chest','Triceps'] },{ label:'Pull B', emoji:'⚙️', focus:'Deadlift · Rows · Biceps volume', muscles:['Back','Biceps','Traps'] },{ label:'Legs B', emoji:'⚡', focus:'RDL-focused · Leg Curl · Abs', muscles:['Hamstrings','Glutes','Core'] }] },
    { id:'B', name:'Plan B — PPL x2 Strength', accentColor:'red',  tagline:'Strength-first, progressive overload', days:[{ label:'Push Strength', emoji:'🏋️', focus:'5x5 Bench · 4x8 OHP', muscles:['Chest','Shoulders','Triceps'] },{ label:'Pull Strength', emoji:'⚡', focus:'5x5 Row · 4x6 Pull-ups', muscles:['Back','Biceps','Rear Delts'] },{ label:'Legs Strength', emoji:'🦵', focus:'5x5 Squat · 3x10 Leg Press', muscles:['Quads','Hamstrings','Glutes'] },{ label:'Push Volume', emoji:'🔥', focus:'4x12 Incline · 5x10 Laterals', muscles:['Chest','Shoulders','Triceps'] },{ label:'Pull Volume', emoji:'💪', focus:'4x12 Pulldown · 5x10 Curls', muscles:['Lats','Biceps','Rear Delts'] },{ label:'Legs Volume', emoji:'🔩', focus:'4x12 RDL · 3x15 Leg Curl · Abs', muscles:['Hamstrings','Glutes','Core'] }] },
  ]},
};
