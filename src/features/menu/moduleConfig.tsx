import type { ReactNode } from "react";
import { ROLES } from "../../lib/types";

/** Un módulo del menú: su texto, la ruta a la que lleva, su ícono y los roles que lo ven. */
export type ModuloMenu = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  roles: string[];
};

/** Ícono del módulo de administración de usuarios. */
function AdminIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

// Lista de módulos del menú. Para añadir uno nuevo también hay que registrar su ruta en App.tsx.
export const MODULOS: ModuloMenu[] = [
  {
    id: "modulo-luminarias",
    label: "Censo luminarias",
    path: "/luminarias/censo",
    icon: <img src="/icons/luminarias.png" className="h-8 w-8 object-contain" alt="" />,
    roles: [ROLES.ADMIN, ROLES.EDITOR_LUMINARIAS],
  },
  {
    id: "modulo-reporte-luminarias",
    label: "Reporte de luminarias",
    path: "/luminarias/reporte",
    icon: <img src="/icons/bulbo.png" className="h-8 w-8 object-contain" alt="" />,
    roles: [ROLES.ADMIN, ROLES.EDITOR_LUMINARIAS],
  },
  {
    id: "modulo-admin-usuarios",
    label: "Administrar Usuarios",
    path: "/admin/usuarios",
    icon: <AdminIcon />,
    roles: [ROLES.ADMIN],
  },
];
