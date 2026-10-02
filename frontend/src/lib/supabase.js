import { createClient } from "@supabase/supabase-js";

/*
  ============================================================
  SUPABASE CLIENT
  ============================================================

  Environment variable naming note:
  ----------------------------------
  This project is built with Vite (not Next.js).

  Vite only exposes environment variables that are prefixed
  with VITE_ to the browser bundle. Variables prefixed with
  NEXT_PUBLIC_ are a Next.js convention and will NOT work here.

  Your .env file must use the VITE_ prefix:

      VITE_SUPABASE_URL=your_supabase_project_url
      VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_public_key

  Security notes:
  ---------------
  - Only the public anon key is used here (safe for client-side).
  - Never put the service-role key in any frontend file.
  - The anon key is safe because Supabase RLS policies restrict
    what unauthenticated/authenticated users can do.
  ============================================================
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables.\n" +
    "Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY " +
    "are set in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
