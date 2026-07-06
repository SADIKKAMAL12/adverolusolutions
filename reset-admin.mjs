import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const sb = createClient(
  'https://srgfvbopyxuolyazasjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZ2Z2Ym9weXh1b2x5YXphc2p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMDI2NSwiZXhwIjoyMDkzMzg2MjY1fQ.s39QV2-U9CUdQRecElC17XdtBdOtz0wPAkoSsWRcbuo'
);

async function main() {
  const email = 'admin@adversolutions.com';
  const password = 'AdminPass123!';
  const hash = await bcrypt.hash(password, 10);
  
  const { data, error } = await sb
    .from('users')
    .update({ password_hash: hash })
    .ilike('email', email)
    .select('id,email,role');
    
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    const { data: newUser, error: createErr } = await sb.from('users').insert({
      id: crypto.randomUUID(),
      name: 'Admin', email, password_hash: hash,
      role: 'admin', status: 'active', balance: 0, accounts: 0
    }).select('id,email,role');
    if (createErr) { console.error(createErr.message); process.exit(1); }
    console.log('Admin created:', newUser[0]);
  } else {
    console.log('Password updated for:', data[0]);
  }
  console.log('Password is:', password);
}

main();
