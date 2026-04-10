// ── DayHistory.js ─────────────────────────────────────────────────────────────
// Immutable audit log: one document per completed journey day per user.
// Used to:
//   • Reconstruct streak from ground truth (timestamp-ordered)
//   • Display "Day 3 of 45" on the Journey Map
//   • Power future analytics / history views
//
// Idempotent: (userId + dayNumber) is unique, so completing a day twice
// does NOT create a duplicate — the route uses findOneAndUpdate + upsert.

const mongoose = require('mongoose');

const DayHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // 1-based journey day number (e.g. 3 = third day of their journey)
  dayNumber: {
    type: Number,
    required: true,
  },

  // ISO timestamp for when this day was marked complete
  completedAt: {
    type: Date,
    default: Date.now,
  },

  // Diet status for this day
  dietStatus: {
    type: String,
    enum: ['completed', 'partial', 'skipped'],
    default: 'completed',
  },

  // Workout status for this day
  workoutStatus: {
    type: String,
    enum: ['completed', 'rest', 'skipped'],
    default: 'completed',
  },

  // Snapshot of which muscles were trained (for future analytics)
  musclesWorked: {
    type: [String],
    default: [],
  },

  // Context at time of completion
  totalDaysInJourney: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true, // adds createdAt + updatedAt
});

// Compound unique index — prevents duplicate entries for same user+day
DayHistorySchema.index({ userId: 1, dayNumber: 1 }, { unique: true });

module.exports = mongoose.model('DayHistory', DayHistorySchema);
