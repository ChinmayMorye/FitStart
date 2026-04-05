const express = require("express");
const router = express.Router();
const Exercise = require("../models/Exercise");

// Add exercise
router.post("/", async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.category) {
      return res.status(400).json({ error: "Please provide all required fields: name, description, category" });
    }

    const exercise = new Exercise(req.body);
    await exercise.save();
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all exercises
router.get("/", async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: exercises.length, data: exercises });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single exercise
router.get("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update exercise
router.put("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete exercise
router.delete("/:id", async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.status(200).json({ success: true, message: "Exercise deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;