import { supabase } from './src/lib/supabase';
import { toAuthEmail } from './src/lib/constants';

const AUTH_PHONE_SUFFIX = '@phone.dianping.local';
const _toAuthEmail = (phone) => `${phone}${AUTH_PHONE_SUFFIX}`;

async function simulateUserFlow() {
  console.log('--- Starting User Flow Simulation (Fix Verification) ---');
  
  const phone = '13146195757';
  const password = 'Password123!';
  const authEmail = _toAuthEmail(phone);

  console.log(`1. Attempting to register/login user with phone: ${phone}`);
  
  // Try sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: authEmail,
    password: password,
    options: { 
        data: { 
            name: 'Test User 131', 
            phone: phone,
            role: 'user' 
        } 
    }
  });
  
  if (signUpError) {
      console.log('Signup result:', signUpError.message);
      // If user already exists, try login
      if (signUpError.message.includes('already registered')) {
          console.log('User already exists, proceeding to login...');
      } else {
          return;
      }
  } else {
      console.log('User registered successfully:', signUpData.user?.id);
  }

  // 2. User Login
  console.log('2. Logging in user...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: password
  });
  
  if (signInError) {
      console.error('Login failed:', signInError.message);
      return;
  }
  console.log('User logged in, session:', !!signInData.session);

  // 3. Access Profile
  console.log('3. Accessing profile to verify data...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signInData.user?.id)
    .single();
    
  if (profileError) {
      console.error('Profile fetch failed:', profileError.message);
  } else {
      console.log('Profile retrieved:', profile);
      if (profile.phone === phone) {
          console.log('SUCCESS: Phone number correctly stored in profile.');
      } else {
          console.error('FAILURE: Phone number mismatch in profile.', profile.phone);
      }
  }
  
  await supabase.auth.signOut();
  console.log('--- Simulation Complete ---\n');
}

async function run() {
  try {
    await simulateUserFlow();
  } catch (e) {
    console.error('TEST FAILED:', e);
  }
}

console.log('To run this simulation, paste the content into the browser console where the app is running.');
