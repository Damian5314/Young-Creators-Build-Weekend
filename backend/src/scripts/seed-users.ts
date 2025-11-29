import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

// Create admin client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
}

const demoUsers: DemoUser[] = [
  {
    email: 'user@demo.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'USER',
  },
  {
    email: 'owner@demo.com',
    password: 'demo123',
    name: 'Demo Owner',
    role: 'OWNER',
  },
];

async function seedUsers() {
  console.log('🌱 Starting user seed...\n');

  for (const user of demoUsers) {
    console.log(`Creating ${user.role}: ${user.email}...`);

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', user.email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      console.log(`  ⚠️  User ${user.email} already exists, updating role...`);

      // Update role if needed
      await supabase
        .from('profiles')
        .update({ role: user.role, name: user.name })
        .eq('email', user.email);

      console.log(`  ✅ Updated ${user.email} with role ${user.role}\n`);
      continue;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: user.name,
      },
    });

    if (authError) {
      console.error(`  ❌ Error creating auth user: ${authError.message}`);
      continue;
    }

    if (!authData.user) {
      console.error(`  ❌ No user returned from auth creation`);
      continue;
    }

    console.log(`  ✅ Auth user created: ${authData.user.id}`);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update profile with role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        name: user.name,
        onboarding_completed: true,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error(`  ❌ Error updating profile: ${profileError.message}`);
    } else {
      console.log(`  ✅ Profile updated with role: ${user.role}\n`);
    }
  }

  // Create a demo restaurant for the owner
  console.log('Creating demo restaurant for owner...');

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'owner@demo.com')
    .single();

  if (ownerProfile) {
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', ownerProfile.id)
      .limit(1);

    if (!existingRestaurant || existingRestaurant.length === 0) {
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: 'Demo Restaurant',
          description: 'A delicious demo restaurant with amazing food!',
          address: 'Damrak 1',
          city: 'Amsterdam',
          latitude: 52.3738,
          longitude: 4.8910,
          cuisine_types: ['Italian', 'Mediterranean'],
          halal: true,
          price_level: 2,
          average_rating: 4.5,
          opening_hours: 'Mon-Sun: 11:00-22:00',
          image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          owner_id: ownerProfile.id,
        });

      if (restaurantError) {
        console.error(`  ❌ Error creating restaurant: ${restaurantError.message}`);
      } else {
        console.log('  ✅ Demo restaurant created\n');
      }
    } else {
      console.log('  ⚠️  Demo restaurant already exists\n');
    }
  }

  console.log('✨ Seed completed!\n');
  console.log('='.repeat(50));
  console.log('DEMO ACCOUNTS:');
  console.log('='.repeat(50));
  console.log('');
  console.log('👤 USER ACCOUNT:');
  console.log('   Email:    user@demo.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('🏪 OWNER ACCOUNT:');
  console.log('   Email:    owner@demo.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('='.repeat(50));
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
