import { supabase, EDGE_FUNCTION_URL } from "../../lib/supabaseClient";

async function getBearerToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error("No se pudo validar la sesión del administrador. Por favor, vuelve a iniciar sesión.");
  }
  return session.access_token;
}

export function useCreateUserFn() {
  async function crearUsuario(payload: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    rol_id: string;
  }) {
    const token = await getBearerToken();

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          'La función de creación segura de usuarios no está desplegada en tu proyecto de Supabase. Despliégala ejecutando: "supabase functions deploy create-user"'
        );
      }
      throw new Error(resData.error || "Error al procesar la creación del usuario.");
    }

    return resData;
  }

  async function eliminarUsuario(authUserId: string) {
    const token = await getBearerToken();

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ auth_user_id: authUserId }),
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.error || "Error al eliminar el usuario.");
    }

    return resData;
  }

  return { crearUsuario, eliminarUsuario };
}
