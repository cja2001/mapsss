import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../components/Button";
import { MODULOS } from "./moduleConfig";
import fondoImg from "../../assets/fondosss.webp";

export function MenuPage() {
  const { rol, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  const modulosVisibles = MODULOS.filter((m) => rol && m.roles.includes(rol));

  return (
    <div
      className="app-shell-bg flex min-h-screen flex-col items-center justify-center gap-10 p-6"
      style={{ "--app-bg-image": `url(${fondoImg})` } as CSSProperties}
    >
      <h1 className="text-3xl font-bold text-white">Bienvenido</h1>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {modulosVisibles.map((modulo) => (
          <Link
            key={modulo.id}
            to={modulo.path}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-brand-800/60 p-5 text-slate-100 shadow-xl shadow-black/20 backdrop-blur-sm transition-colors hover:border-brand-400/40 hover:bg-brand-700/60"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-300">
              {modulo.icon}
            </span>
            <span className="text-sm font-semibold">{modulo.label}</span>
          </Link>
        ))}
      </div>

      <Button variant="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
