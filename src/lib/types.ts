/** Rol de usuario, tal como está en la tabla roles. */
export type Rol = {
  id: number;
  nombre: string;
};

/** Usuario de la app, tal como está en la tabla usuarios. */
export type Usuario = {
  auth_user_id: string;
  email: string | null;
  nombre: string | null;
  apellido: string | null;
  rol_id: number;
  activo: boolean;
};

/** Usuario junto con el nombre de su rol (resultado de unir usuarios con roles). */
export type UsuarioConRol = Usuario & {
  roles: { nombre: string } | null;
};

/** Luminaria, tal como está en la tabla luminarias. */
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

/** Valores permitidos para el campo servicio. */
export type Servicio = "nuevo" | "antiguo";

// Opciones de servicio con su etiqueta, para los selectores.
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

// Nombres de los roles, iguales a los de la tabla roles.
export const ROLES = {
  ADMIN: "admin",
  EDITOR_LUMINARIAS: "editor_luminarias",
} as const;
