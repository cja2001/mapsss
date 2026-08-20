export type Rol = {
  id: number;
  nombre: string;
};

export type Usuario = {
  auth_user_id: string;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  rol_id: number;
  activo: boolean;
};

export type UsuarioConRol = Usuario & {
  roles: { nombre: string } | null;
};

export type Luminaria = {
  id: number;
  lat: number | null;
  lng: number | null;
  tipo: string | null;
  potencia: string | null;
  estado: string | null;
  distrito: string | null;
  tasada: boolean;
};

export const ROLES = {
  ADMIN: "admin",
  EDITOR_LUMINARIAS: "editor_luminarias",
} as const;
