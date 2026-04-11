/**
 * One-time script: delete ALL users from the FitStart database.
 * Run with:  node clearUsers.js
 */
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/fitstart';

async function clearAllUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} user(s) from the database.`);

    // Also clear the dayhistories collection if it exists
    try {
      const h = await mongoose.connection.db.collection('dayhistories').deleteMany({});
      console.log(`🗑️  Deleted ${h.deletedCount} day history record(s).`);
    } catch (_) {}

    console.log('✅ Database is now clean. Registered accounts = 0.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

clearAllUsers();
