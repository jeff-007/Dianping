import { supabase } from './src/lib/supabase';
import { toAuthEmail } from './src/lib/constants';

// Manual import since we are in a script
const AUTH_PHONE_SUFFIX = '@phone.dianping.local';
const _toAuthEmail = (phone) => `${phone}${AUTH_PHONE_SUFFIX}`;

async function verifyLogin() {
  console.log('--- Verifying Login for Fixed User ---');
  
  const phone = '13146195757';
  const password = 'Password123!';
  const authEmail = _toAuthEmail(phone);

  console.log(`Attempting login for: ${phone} (Email: ${authEmail})`);
  
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: password
  });
  
  if (signInError) {
      console.error('LOGIN FAILED:', signInError.message);
  } else {
      console.log('LOGIN SUCCESS!');
      console.log('User ID:', signInData.user?.id);
      console.log('Email:', signInData.user?.email);
  }
}

verifyLogin();
