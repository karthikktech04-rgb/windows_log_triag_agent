import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  console.warn('⚠️ Supabase environment variables are missing from .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);