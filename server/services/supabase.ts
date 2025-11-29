import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

function getSupabaseKey(): string {
  return process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();

    if (!url || !key) {
      throw new Error('Supabase URL and key are required. Check your .env file.');
    }

    supabaseInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseInstance;
}

export function createUserClient(jwt: string): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  return createClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${jwt}` },
    },
  });
}

// For backwards compatibility
export const supabase = {
  get client() {
    return getSupabase();
  }
};
