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
  /** Si el servicio es nuevo o antiguo. `null` = sin clasificar. */
  servicio: Servicio | null;
};

export type Servicio = "nuevo" | "antiguo";

export const SERVICIOS: { value: Servicio; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "antiguo", label: "Antiguo" },
];

/** Un cambio registrado en el historial de una luminaria (de tipo o de potencia). */
export type CambioLuminaria = {
  /** Único entre ambos historiales, p. ej. "tipo-12" o "potencia-3". */
  id: string;
  campo: "tipo" | "potencia";
  anterior: string | null;
  nuevo: string | null;
  cambiado_por_email: string | null;
  cambiado_en: string;
};

export const ROLES = {
  ADMIN: "admin",
  EDITOR_LUMINARIAS: "editor_luminarias",
} as const;
