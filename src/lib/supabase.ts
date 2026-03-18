import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const SUPABASE_URL = (supabaseUrlRaw ?? "").trim();
const SUPABASE_ANON_KEY = (supabaseAnonKeyRaw ?? "").trim();

// Temporary debug, remove after confirming
console.log("SUPABASE_URL resolved to:", SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_URL.startsWith("https://") || !SUPABASE_URL.includes(".supabase.co")) {
  throw new Error(
    "Supabase URL is missing or invalid. Check VITE_SUPABASE_URL in your .env or .env.local."
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.length < 20) {
  throw new Error(
    "Supabase anon key is missing or invalid. Check VITE_SUPABASE_ANON_KEY in your .env or .env.local."
  );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = (): boolean => true;