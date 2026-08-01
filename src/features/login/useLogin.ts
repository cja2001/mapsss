import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import { ROLES } from "../../lib/types";

type FieldErrors = { usuario?: string; password?: string };

export function useLogin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!usuario.trim()) {
      errors.usuario = "El usuario es requerido.";
    }

    if (!password) {
      errors.password = "La contraseña es requerida.";
    } else if (password.length < 6) {
      errors.password = "Mínimo 6 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function obtenerRolUsuario(authUserId: string) {
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("activo, rol_id, email, auth_user_id")
      .eq("auth_user_id", authUserId)
      .single();

    if (perfilError || !perfil) {
      throw new Error("No se pudo obtener el perfil del usuario.");
    }

    if (!perfil.activo) {
      throw new Error("Tu usuario está inactivo.");
    }

    const { data: rolData, error: rolError } = await supabase
      .from("roles")
      .select("nombre")
      .eq("id", perfil.rol_id)
      .single();

    if (rolError || !rolData) {
      throw new Error("No se pudo obtener el rol del usuario.");
    }

    return rolData.nombre as string;
  }

  async function handleLogin() {
    setFieldErrors({});
    setGlobalError(null);
    setGlobalSuccess(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: usuario.trim(),
        password,
      });

      if (loginError) {
        const msg = loginError.message.includes("Invalid login credentials")
          ? "Credenciales incorrectas."
          : loginError.message;
        setGlobalError(msg);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setGlobalError("No se pudo obtener la sesión del usuario.");
        setLoading(false);
        return;
      }

      const rol = await obtenerRolUsuario(authData.user.id);

      if (rol !== ROLES.ADMIN && rol !== ROLES.EDITOR_LUMINARIAS) {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos para acceder al sistema.");
      }

      setGlobalSuccess("✓ Acceso concedido. Redirigiendo...");

      setTimeout(() => navigate("/menu"), 300);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return {
    usuario,
    setUsuario,
    password,
    setPassword,
    fieldErrors,
    globalError,
    globalSuccess,
    loading,
    handleLogin,
  };
}
