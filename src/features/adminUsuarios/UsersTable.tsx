import { useState } from "react";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Alert } from "../../components/Alert";
import type { Rol, UsuarioConRol } from "../../lib/types";
import { useCreateUserFn } from "./useCreateUserFn";

export function UsersTable({
  usuarios,
  roles,
  loading,
  actualizarRol,
  alternarActivo,
  recargar,
}: {
  usuarios: UsuarioConRol[];
  roles: Rol[];
  loading: boolean;
  actualizarRol: (authUserId: string, nuevoRolId: number) => Promise<void>;
  alternarActivo: (authUserId: string, activoActual: boolean) => Promise<void>;
  recargar: () => Promise<void>;
}) {
  const { eliminarUsuario } = useCreateUserFn();
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onCambiarRol(authUserId: string, rolId: string) {
    try {
      await actualizarRol(authUserId, parseInt(rolId, 10));
      setMsg({ text: "✓ Rol actualizado", type: "success" });
    } catch (err) {
      setMsg({ text: "Error al cambiar rol: " + (err instanceof Error ? err.message : err), type: "error" });
    }
  }

  async function onToggleActivo(u: UsuarioConRol) {
    const accion = u.activo ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que deseas ${accion} este usuario?`)) return;

    try {
      await alternarActivo(u.auth_user_id, u.activo);
      setMsg({ text: u.activo ? "✓ Usuario desactivado" : "✓ Usuario activado", type: "success" });
    } catch (err) {
      setMsg({ text: "Error: " + (err instanceof Error ? err.message : err), type: "error" });
    }
  }

  async function onEliminar(authUserId: string) {
    if (!confirm("¿Seguro que deseas eliminar este usuario permanentemente? Esta acción no se puede deshacer.")) return;

    setBusyId(authUserId);
    try {
      await eliminarUsuario(authUserId);
      setMsg({ text: "✓ Usuario eliminado permanentemente", type: "success" });
      await recargar();
    } catch (err) {
      setMsg({ text: "Error: " + (err instanceof Error ? err.message : err), type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="overflow-x-auto">
      <h2 className="mb-4 text-lg font-bold text-white">Usuarios</h2>

      {msg && (
        <div className="mb-3">
          <Alert message={msg.text} type={msg.type} />
        </div>
      )}

      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-3">Nombre</th>
            <th className="py-2 pr-3">Apellido</th>
            <th className="py-2 pr-3">Email</th>
            <th className="py-2 pr-3">Rol</th>
            <th className="py-2 pr-3">Estado</th>
            <th className="py-2 pr-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                Cargando…
              </td>
            </tr>
          ) : usuarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.auth_user_id} className="border-b border-white/5 text-slate-200">
                <td className="py-2 pr-3">{u.nombre || "—"}</td>
                <td className="py-2 pr-3">{u.apellido || "—"}</td>
                <td className="py-2 pr-3">{u.email || "N/D"}</td>
                <td className="py-2 pr-3">
                  <select
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-100"
                    defaultValue={u.rol_id}
                    onChange={(e) => onCambiarRol(u.auth_user_id, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-3">
                  <Badge active={u.activo} />
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleActivo(u)}
                      className="rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100 hover:bg-white/15"
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => onEliminar(u.auth_user_id)}
                      disabled={busyId === u.auth_user_id}
                      className="rounded bg-status-danger/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-status-danger disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
