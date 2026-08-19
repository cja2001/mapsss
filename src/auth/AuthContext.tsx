import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type AuthStatus = "loading" | "ready" | "error";

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  rol: string | null;
  activo: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

const CLAVE_PERFIL_CACHE = "auth_perfil_cache";

type PerfilCache = { authUserId: string; rol: string; activo: boolean };

function leerPerfilCache(authUserId: string): PerfilCache | null {
  try {
    const raw = localStorage.getItem(CLAVE_PERFIL_CACHE);
    if (!raw) return null;
    const cache = JSON.parse(raw) as PerfilCache;
    return cache.authUserId === authUserId ? cache : null;
  } catch {
    return null;
  }
}

function guardarPerfilCache(cache: PerfilCache) {
  try {
    localStorage.setItem(CLAVE_PERFIL_CACHE, JSON.stringify(cache));
  } catch {
    // almacenamiento no disponible; no es crítico
  }
}

/**
 * Consulta el rol/estado del usuario en Supabase. Sin conexión, usa el último
 * valor confirmado (guardado en `guardarPerfilCache`) para que una sesión ya
 * iniciada siga entrando a la app sin señal, en vez de expulsar al login.
 */
async function resolverRolYActivo(authUserId: string) {
  if (!navigator.onLine) {
    const cache = leerPerfilCache(authUserId);
    if (cache) return { rol: cache.rol, activo: cache.activo };
    throw new Error("Sin conexión: no hay una sesión guardada para entrar sin señal.");
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios")
    .select("activo, roles ( nombre )")
    .eq("auth_user_id", authUserId)
    .single();

  if (perfilError || !perfil) {
    const cache = leerPerfilCache(authUserId);
    if (cache && !navigator.onLine) return { rol: cache.rol, activo: cache.activo };
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  if (!perfil.activo) {
    throw new Error("Tu usuario está inactivo.");
  }

  const roles = perfil.roles as unknown as { nombre: string } | { nombre: string }[] | null;
  const rolNombre = Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre;

  if (!rolNombre) {
    throw new Error("No se pudo obtener el rol del usuario.");
  }

  guardarPerfilCache({ authUserId, rol: rolNombre, activo: perfil.activo });
  return { rol: rolNombre, activo: perfil.activo as boolean };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarPerfil(nextSession: Session | null) {
      setSession(nextSession);

      if (!nextSession) {
        setRol(null);
        setActivo(false);
        setStatus("ready");
        return;
      }

      try {
        const { rol: nuevoRol, activo: nuevoActivo } = await resolverRolYActivo(
          nextSession.user.id
        );
        if (cancelado) return;
        setRol(nuevoRol);
        setActivo(nuevoActivo);
        setStatus("ready");
      } catch (err) {
        if (cancelado) return;
        setRol(null);
        setActivo(false);
        setError(err instanceof Error ? err.message : "Error de autenticación.");
        setStatus("error");
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelado) cargarPerfil(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setStatus("loading");
      cargarPerfil(nextSession);
    });

    return () => {
      cancelado = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ status, session, rol, activo, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
