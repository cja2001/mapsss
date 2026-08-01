import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltan variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (revisa .env.local)."
  );
}

export const supabase = createClient(url, anonKey);

export const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL as string;
