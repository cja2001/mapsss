import type { CSSProperties } from "react";
import { Link } from "react-router";
import { useUsuarios } from "./useUsuarios";
import { CreateUserForm } from "./CreateUserForm";
import { UsersTable } from "./UsersTable";
import fondoImg from "../../assets/fondosss.webp";

export function AdminUsuariosPage() {
  const { usuarios, roles, loading, recargar, actualizarRol, alternarActivo } = useUsuarios();

  return (
    <div
      className="app-shell-bg min-h-screen p-6"
      style={{ "--app-bg-image": `url(${fondoImg})` } as CSSProperties}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Administrar Usuarios</h1>
          <Link
            to="/menu"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            ← Menú
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <CreateUserForm roles={roles} onCreated={recargar} />
          <UsersTable
            usuarios={usuarios}
            roles={roles}
            loading={loading}
            actualizarRol={actualizarRol}
            alternarActivo={alternarActivo}
            recargar={recargar}
          />
        </div>
      </div>
    </div>
  );
}
