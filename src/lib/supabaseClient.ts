import { createClient } from "@supabase/supabase-js";

// Credenciales del proyecto de Supabase, tomadas de las variables de entorno de Vite.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin credenciales la app no puede funcionar: se falla de inmediato con un mensaje claro.
if (!url || !anonKey) {
  throw new Error(
    "Faltan variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (revisa .env.local)."
  );
}

// Cliente único de Supabase que usa toda la app (base de datos y autenticación).
export const supabase = createClient(url, anonKey);

// URL de la Edge Function que crea y elimina usuarios.
export const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL as string;
