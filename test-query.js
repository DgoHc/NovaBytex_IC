const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://apcpqwyjlwyvusbynngd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwY3Bxd3lqbHd5dnVzYnlubmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDcwNjExNiwiZXhwIjoyMTA2MjgyMTE2fQ.mUnAUmGX8cJC3fBAwiJh9OkAuqDpFjlV_jjsTOuA5DY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFetch() {
  const id = '49e580a4-4c0e-4807-bf02-0819639b91f9';
  console.time('fetchProfile');
  
  const { data, error } = await supabase
    .from("nfc_profiles")
    .select("*, cards:nfc_cards(*)")
    .eq("id", id)
    .single();
    
  console.timeEnd('fetchProfile');
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profile name:', data.name);
  }
}

testFetch();
