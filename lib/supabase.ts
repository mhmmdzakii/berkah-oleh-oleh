import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ini adalah "mesin" yang akan kita panggil setiap kali mau ambil atau simpan data
export const supabase = createClient(supabaseUrl, supabaseAnonKey);