const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Use service role key for storage operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);
// Regular client for DB operations
const supabase = require('../config/supabase');

const BUCKET = 'avatars';

// Use memory storage — no local files, goes straight to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Middleware: verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Ensure the avatars bucket exists and is public
async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
}
ensureBucket().catch(console.error);

// POST /api/upload/pfp
router.post('/pfp', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop();
    const fileName = `pfp_${req.userId}_${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    // Get the permanent public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Save public URL in database
    const { data, error } = await supabase
      .from('users')
      .update({ profile_picture: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', req.userId)
      .select('id')
      .single();

    if (error || !data) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile picture updated',
      profilePicture: publicUrl,
      profilePictureUrl: publicUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/upload/pfp
router.get('/pfp', verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('username, profile_picture')
      .eq('id', req.userId)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    const url = user.profile_picture || null;

    res.json({
      username: user.username,
      profilePicture: url,
      profilePictureUrl: url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
