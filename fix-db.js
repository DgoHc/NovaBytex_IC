const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://apcpqwyjlwyvusbynngd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwY3Bxd3lqbHd5dnVzYnlubmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDcwNjExNiwiZXhwIjoyMTA2MjgyMTE2fQ.mUnAUmGX8cJC3fBAwiJh9OkAuqDpFjlV_jjsTOuA5DY'
);

async function fix() {
  const profileId = '49e580a4-4c0e-4807-bf02-0819639b91f9';
  console.log(`Fixing profile: ${profileId}`);
  
  const { data, error } = await supabase
    .from('nfc_profiles')
    .select('avatar_url, logo_url')
    .eq('id', profileId)
    .single();
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Avatar URL length:', data.avatar_url?.length);
  console.log('Logo URL length:', data.logo_url?.length);
  
  const updates = {};
  if (data.avatar_url && data.avatar_url.startsWith('data:image')) {
    updates.avatar_url = null;
  }
  if (data.logo_url && data.logo_url.startsWith('data:image')) {
    updates.logo_url = null;
  }
  
  if (Object.keys(updates).length > 0) {
    console.log('Clearing base64 strings...');
    const { error: updateError } = await supabase
      .from('nfc_profiles')
      .update(updates)
      .eq('id', profileId);
      
    if (updateError) console.error('Update error:', updateError);
    else console.log('Fixed successfully!');
  } else {
    console.log('No base64 strings found.');
  }
}

fix();
