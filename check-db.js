const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://apcpqwyjlwyvusbynngd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwY3Bxd3lqbHd5dnVzYnlubmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDcwNjExNiwiZXhwIjoyMTA2MjgyMTE2fQ.mUnAUmGX8cJC3fBAwiJh9OkAuqDpFjlV_jjsTOuA5DY'
);

async function check() {
  const profileId = '49e580a4-4c0e-4807-bf02-0819639b91f9';
  console.log(`Checking profile: ${profileId}`);
  
  const { data, error } = await supabase
    .from('nfc_profiles')
    .select('*, cards:nfc_cards(*)')
    .eq('id', profileId)
    .single();
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log("Data size:", JSON.stringify(data).length);
  for (const key in data) {
    if (typeof data[key] === 'string' && data[key].length > 500) {
      console.log(`- ${key} is HUGE: ${data[key].length} chars`);
    }
  }
  console.log('Check complete.');
}

check();
