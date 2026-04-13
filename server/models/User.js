const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true }, // in cm
  weight: { type: Number, required: true }, // in kg
  role: { type: String, default: 'user' },
  profilePicture: { type: String, default: null }, // stores filename of uploaded pfp

  // Journey / Streak tracking
  journeyData: {
    totalDays:     { type: Number, default: null },
    workoutPlace:  { type: [String], default: [] },
    completedDays: { type: [Number], default: [] },
    startDate:     { type: Date, default: null },
    lastActiveDate:{ type: Date, default: null },
    currentStreak: { type: Number, default: 0 },
  },

  // Saved preferences from Diet / Workout pages
  preferences: {
    dietType:         { type: String,  default: null },     // 'veg' | 'nonveg'
    workoutDays:      { type: Number,  default: null },     // 1-6
    workoutPlanId:    { type: String,  default: null },     // 'A' | 'B'
    restDay:          { type: String,  default: 'Sunday' }, // e.g. 'Sunday' | 'Saturday'
    // "Save for future" flags — only true when user explicitly checks the box
    saveDiet:         { type: Boolean, default: false },
    saveWorkout:      { type: Boolean, default: false },
    // Last journey day the user completed (for Admin visibility)
    lastCompletedDay: { type: Number,  default: null },
    // Timestamp of last preference change
    prefsUpdatedAt:   { type: Date,    default: null },
  },
}, { timestamps: true });

// Middleware to hash password before saving (Mongoose 9.x compatible)
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);