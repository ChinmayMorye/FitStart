// resetAllUsers.js — Run once to wipe all user plan/streak data
// Usage: node server/resetAllUsers.js

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function resetAll() {
  console.log('🔄 Resetting ALL users plans, streak, and journey data...\n');

  // 1. Reset all users table — wipe plans + journey
  const { error: userError } = await supabase
    .from('users')
    .update({
      // Journey fields
      journey_total_days:      null,
      journey_completed_days:  [],
      journey_start_date:      null,
      journey_last_active:     null,
      journey_streak:          0,
      journey_workout_place:   [],
      // Preference / plan fields
      diet_plan:               null,
      workout_days:            null,
      workout_plan:            null,
      rest_day:                'Sunday',
      save_diet:               false,
      save_workout:            false,
      last_completed_day:      null,
      pref_updated_at:         null,
      both_veg_days:           [],
      both_nonveg_days:        [],
      diet_checks:             {},
      workout_checks:          {},
      updated_at:              new Date().toISOString(),
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (userError) {
    console.error('❌ Error resetting users:', userError.message);
  } else {
    console.log('✅ All users reset successfully');
  }

  // 2. Delete all day_histories
  const { error: histError } = await supabase
    .from('day_histories')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (histError) {
    console.error('❌ Error deleting day_histories:', histError.message);
  } else {
    console.log('✅ All day_histories deleted');
  }

  console.log('\n🎉 Done! All user data has been wiped. Users will start fresh on next login.');
}

resetAll().catch(console.error);
