import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Rol, UsuarioConRol } from "../../lib/types";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarRoles = useCallback(async () => {
    const { data, error: err } = await supabase.from("roles").select("id, nombre").order("nombre");
    if (err) {
      setError("Error al cargar roles: " + err.message);
      return;
    }
    setRoles(data ?? []);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("usuarios")
      .select("auth_user_id, email, nombre, apellido, activo, rol_id, roles(nombre)")
      .order("email");

    if (err) {
      setError("Error: " + err.message);
      setLoading(false);
      return;
    }

    setUsuarios((data ?? []) as unknown as UsuarioConRol[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarRoles();
    cargarUsuarios();
  }, [cargarRoles, cargarUsuarios]);

  async function actualizarRol(authUserId: string, nuevoRolId: number) {
    const { error: err } = await supabase
      .from("usuarios")
      .update({ rol_id: nuevoRolId })
      .eq("auth_user_id", authUserId);
    if (err) throw new Error(err.message);
    await cargarUsuarios();
  }

  async function alternarActivo(authUserId: string, activoActual: boolean) {
    const { error: err } = await supabase
      .from("usuarios")
      .update({ activo: !activoActual })
      .eq("auth_user_id", authUserId);
    if (err) throw new Error(err.message);
    await cargarUsuarios();
  }

  return {
    usuarios,
    roles,
    loading,
    error,
    setError,
    recargar: cargarUsuarios,
    actualizarRol,
    alternarActivo,
  };
}
