const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Add exercise
router.post('/', async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Please provide all required fields: name, description, category' });
    }

    const { data, error } = await supabase
      .from('exercises')
      .insert([{ name, description, category }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single exercise
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Exercise not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update exercise
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Exercise not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete exercise
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Exercise not found' });
    res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;