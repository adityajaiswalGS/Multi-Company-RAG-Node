// src/lib/supabase.js   ← REPLACE YOUR WHOLE FILE WITH THIS
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createPagesBrowserClient({
  supabaseUrl,  
  supabaseKey: supabaseAnonKey,
});

export const createServerClient = () =>
  createClient(supabaseUrl, supabaseAnonKey);