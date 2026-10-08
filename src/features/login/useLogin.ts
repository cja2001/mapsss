import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabaseClient";
import { ROLES } from "../../lib/types";

// Errores de validación por campo.
type FieldErrors = { usuario?: string; password?: string };

/** Lógica del inicio de sesión: estado del formulario, validación y autenticación con Supabase. */
export function useLogin() {
  const navigate = useNavigate();
  // Valores de los campos, mensajes y estado de envío.
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Valida los campos antes de enviar; devuelve true si no hay errores.
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

  // Consulta el perfil del usuario y devuelve el nombre de su rol. Falla si está inactivo.
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

    // Con el rol_id del perfil se busca el nombre del rol.
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

  // Envía el formulario: valida, autentica, comprueba el rol y redirige al menú.
  async function handleLogin() {
    // Limpia los mensajes del intento anterior.
    setFieldErrors({});
    setGlobalError(null);
    setGlobalSuccess(null);

    if (!validate()) return;

    setLoading(true);

    try {
      // Autenticación con correo y contraseña.
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: usuario.trim(),
        password,
      });

      // Credenciales rechazadas: se muestra el mensaje en español.
      if (loginError) {
        const msg = loginError.message.includes("Invalid login credentials")
          ? "Credenciales incorrectas."
          : loginError.message;
        setGlobalError(msg);
        setLoading(false);
        return;
      }

      // Se obtiene el usuario autenticado para consultar su rol.
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setGlobalError("No se pudo obtener la sesión del usuario.");
        setLoading(false);
        return;
      }

      const rol = await obtenerRolUsuario(authData.user.id);

      // Solo los roles conocidos pueden entrar; a cualquier otro se le cierra la sesión.
      if (rol !== ROLES.ADMIN && rol !== ROLES.EDITOR_LUMINARIAS) {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos para acceder al sistema.");
      }

      setGlobalSuccess("✓ Acceso concedido. Redirigiendo...");

      // Pequeña espera para que se alcance a ver el mensaje de éxito antes de redirigir.
      setTimeout(() => navigate("/menu"), 300);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  // Lo que usa la pantalla de inicio de sesión.
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
