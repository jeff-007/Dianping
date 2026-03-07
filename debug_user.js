import { createClient } from '@supabase/supabase-js';

// Service Role Key from previous tool output
const supabaseUrl = 'https://oqhfnouxxodlmnolokmt.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xaGZub3V4eG9kbG1ub2xva210Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg2MTYzMSwiZXhwIjoyMDg4NDM3NjMxfQ.xX8Or9iJIE-uoc6zNNNciS_rMAyZIhrAFqPZaVUy7Tk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugUser() {
  console.log('Searching for user 13146195757...');

  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return;
  }

  const targetPhone = '13146195757';
  const targetEmail = '13146195757@phone.dianping.local';

  const user = users.find(u => 
    u.phone === targetPhone || 
    u.email === targetEmail || 
    (u.user_metadata && u.user_metadata.phone === targetPhone)
  );

  if (user) {
    console.log('User Found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Phone:', user.phone);
    console.log('Confirmed At:', user.confirmed_at);
    console.log('Metadata:', user.user_metadata);
    
    // Check if password update is needed
    // We can't check the password, but we can reset it to ensure it's known.
    console.log('\nResetting password to: Password123!');
    
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: 'Password123!' }
    );

    if (updateError) {
        console.error('Failed to update password:', updateError);
    } else {
        console.log('Password updated successfully.');
    }
    
    // If the user has a phone but NO email, or wrong email, we might want to patch it 
    // to match our "Phone as Email" workaround so the UI works.
    if (user.email !== targetEmail) {
        console.log(`\nUser email mismatch. Updating email to ${targetEmail} for compatibility...`);
        const { error: emailError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email: targetEmail, email_confirm: true }
        );
        if (emailError) {
             console.error('Failed to update email:', emailError);
        } else {
             console.log('Email updated successfully.');
        }
    }

    // Ensure confirmed
    if (!user.confirmed_at) {
        console.log('\nUser not confirmed. Confirming now...');
         const { error: confirmError } = await supabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
        );
        if (confirmError) console.error('Failed to confirm:', confirmError);
        else console.log('User confirmed.');
    }

  } else {
    console.log('User NOT found in auth.users.');
  }
}

debugUser();
