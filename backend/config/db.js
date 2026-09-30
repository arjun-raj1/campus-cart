const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
let supabase;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Client Initialized');
} else {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY. Database not connected.');
}

module.exports = { supabase };
