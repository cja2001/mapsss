import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

// Estados posibles de la autenticación mientras se resuelve la sesión.
type AuthStatus = "loading" | "ready" | "error";

/** Lo que el contexto de autenticación expone a toda la app. */
type AuthState = {
  status: AuthStatus;
  session: Session | null;
  rol: string | null;
  activo: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

// Contexto de React; se lee con el hook useAuth().
export const AuthContext = createContext<AuthState | undefined>(undefined);

// Copia local del último perfil confirmado, para poder entrar sin conexión.
const CLAVE_PERFIL_CACHE = "auth_perfil_cache";

type PerfilCache = { authUserId: string; rol: string; activo: boolean };

/** Lee el perfil guardado, solo si pertenece al usuario indicado. */
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

/** Guarda el perfil confirmado en localStorage. */
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
  // Sin conexión: se usa el perfil guardado o se rechaza el acceso.
  if (!navigator.onLine) {
    const cache = leerPerfilCache(authUserId);
    if (cache) return { rol: cache.rol, activo: cache.activo };
    throw new Error("Sin conexión: no hay una sesión guardada para entrar sin señal.");
  }

  // Con conexión: se consulta en la tabla usuarios si está activo y cuál es su rol.
  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios")
    .select("activo, roles ( nombre )")
    .eq("auth_user_id", authUserId)
    .single();

  // Si la consulta falla, se intenta con el perfil guardado antes de dar error.
  if (perfilError || !perfil) {
    const cache = leerPerfilCache(authUserId);
    if (cache && !navigator.onLine) return { rol: cache.rol, activo: cache.activo };
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  // Un usuario desactivado no puede entrar.
  if (!perfil.activo) {
    throw new Error("Tu usuario está inactivo.");
  }

  // Supabase puede devolver la relación roles como objeto o como arreglo; se toma el nombre en ambos casos.
  const roles = perfil.roles as unknown as { nombre: string } | { nombre: string }[] | null;
  const rolNombre = Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre;

  if (!rolNombre) {
    throw new Error("No se pudo obtener el rol del usuario.");
  }

  // Se guarda el perfil confirmado para futuros accesos sin conexión.
  guardarPerfilCache({ authUserId, rol: rolNombre, activo: perfil.activo });
  return { rol: rolNombre, activo: perfil.activo as boolean };
}

/** Proveedor de sesión: mantiene la sesión de Supabase y el rol del usuario, y los comparte por contexto. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Id del usuario cuyo perfil ya está cargado; sirve para reconocer los eventos
  // de sesión que no cambian de usuario (ver onAuthStateChange más abajo).
  const usuarioCargadoRef = useRef<string | null>(null);

  // Al montar: carga la sesión actual y se suscribe a los cambios de autenticación.
  useEffect(() => {
    let cancelado = false;

    // Actualiza el estado a partir de una sesión (o de su ausencia).
    async function cargarPerfil(nextSession: Session | null) {
      setSession(nextSession);

      // Sin sesión: se limpia el perfil.
      if (!nextSession) {
        usuarioCargadoRef.current = null;
        setRol(null);
        setActivo(false);
        setStatus("ready");
        return;
      }

      // Con sesión: se resuelve el rol y si el usuario está activo.
      try {
        const { rol: nuevoRol, activo: nuevoActivo } = await resolverRolYActivo(
          nextSession.user.id
        );
        if (cancelado) return;
        usuarioCargadoRef.current = nextSession.user.id;
        setRol(nuevoRol);
        setActivo(nuevoActivo);
        setStatus("ready");
      } catch (err) {
        if (cancelado) return;
        usuarioCargadoRef.current = null;
        setRol(null);
        setActivo(false);
        setError(err instanceof Error ? err.message : "Error de autenticación.");
        setStatus("error");
      }
    }

    // Sesión inicial al abrir la app.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelado) cargarPerfil(data.session);
    });

    // Cambios posteriores: inicio y cierre de sesión.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Cada vez que la pestaña vuelve a ser visible, Supabase revisa la sesión
      // y emite SIGNED_IN (o TOKEN_REFRESHED) aunque el usuario sea el mismo; al
      // suscribirse emite además INITIAL_SESSION, redundante con getSession().
      // En esos casos solo se actualiza la sesión: pasar a "loading" desmontaría
      // las vistas protegidas (p. ej. el mapa, que perdería su posición y
      // volvería a descargar las luminarias) por un simple cambio de pestaña.
      const mismoUsuario =
        !!nextSession && nextSession.user.id === usuarioCargadoRef.current;
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION" || mismoUsuario) {
        setSession(nextSession);
        return;
      }
      setStatus("loading");
      cargarPerfil(nextSession);
    });

    // Al desmontar: se cancela la suscripción y se ignoran las respuestas tardías.
    return () => {
      cancelado = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Cierra la sesión en Supabase.
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ status, session, rol, activo, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
