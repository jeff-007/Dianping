import { supabase } from './src/lib/supabase';
import { toAuthEmail } from './src/lib/constants';

// Since we are running this in a context where imports might not work as expected if node modules aren't standard (like browser console),
// we might need to inline the constant logic if pasting into console.
// But for codebase consistency, let's assume we can import or the user has the app running.

const AUTH_PHONE_SUFFIX = '@phone.dianping.local';
const _toAuthEmail = (phone) => `${phone}${AUTH_PHONE_SUFFIX}`;

async function simulateUserFlow() {
  console.log('--- Starting User Flow Simulation (Phone Workaround) ---');
  
  const phone = `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const password = 'Password123!';
  // Workaround: Use phone as email
  const authEmail = _toAuthEmail(phone);

  console.log(`1. Registering user with phone: ${phone} (Email: ${authEmail})`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: authEmail,
    password: password,
    options: { 
        data: { 
            name: 'Test User', 
            phone: phone,
            role: 'user' 
        } 
    }
  });
  
  if (signUpError) {
      console.error('Signup failed:', signUpError.message);
      return;
  }
  console.log('User registered:', signUpData.user?.id);

  // 2. User Login
  console.log('2. Logging in user...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: password
  });
  if (signInError) throw signInError;
  console.log('User logged in, session:', !!signInData.session);

  // 3. Access Profile
  console.log('3. Accessing profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signInData.user?.id)
    .single();
  if (profileError) throw profileError;
  console.log('Profile retrieved:', profile.name, 'Phone:', profile.phone);
  
  await supabase.auth.signOut();
  console.log('--- User Flow Complete ---\n');
}

async function simulateMerchantFlow() {
  console.log('--- Starting Merchant Flow Simulation (Phone Workaround) ---');
  const phone = `139${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
  const password = 'Password123!';
  const authEmail = _toAuthEmail(phone);

  // 1. Merchant Registration
  console.log(`1. Registering merchant user: ${phone}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: authEmail,
    password: password,
    options: { 
        data: { 
            name: 'Test Merchant', 
            phone: phone,
            role: 'merchant' 
        } 
    }
  });
  
  if (signUpError) {
      console.error('Merchant signup failed:', signUpError.message);
      return;
  }
  console.log('Merchant user registered:', signUpData.user?.id);

  console.log('2. Creating merchant shop profile...');
  const { error: merchantError } = await supabase
    .from('merchants')
    .insert({
      owner_id: signUpData.user?.id,
      name: 'Test Shop',
      address: '123 Test St',
      audit_status: 'pending',
      phone: phone
    });
  if (merchantError) throw merchantError;
  console.log('Merchant shop profile created (pending)');

  // 3. Login Check
  console.log('3. Logging in merchant...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password
  });
  if (signInError) throw signInError;

  const { data: merchantProfile } = await supabase
      .from('merchants')
      .select('audit_status')
      .eq('owner_id', signInData.user?.id)
      .single();
  
  console.log('Merchant status:', merchantProfile?.audit_status);
  if (merchantProfile?.audit_status !== 'pending') throw new Error('Expected pending status');

  await supabase.auth.signOut();
  console.log('--- Merchant Flow Complete ---');
}

async function run() {
  try {
    await simulateUserFlow();
    await simulateMerchantFlow();
    console.log('ALL TESTS PASSED');
  } catch (e) {
    console.error('TEST FAILED:', e);
  }
}

console.log('To run this simulation, paste the content into the browser console where the app is running.');
