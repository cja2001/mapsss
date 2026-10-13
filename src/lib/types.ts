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
  /** Qué tiene dañado la luminaria. Solo aplica cuando el estado es "dañada". */
  tipo_dano: TipoDano | null;
};

/** Tipos de daño que se pueden reportar. */
export type TipoDano = "lampara quemada" | "Brazo dañado" | "Fotocelda dañada" | "Cables dañados";

// Tipos de daño con su etiqueta, para los selectores. Los `value` deben coincidir exactamente
// con los del check `luminarias_tipo_dano_check` de la base de datos.
export const TIPOS_DANO: { value: TipoDano; label: string }[] = [
  { value: "lampara quemada", label: "Lámpara quemada" },
  { value: "Brazo dañado", label: "Brazo dañado" },
  { value: "Fotocelda dañada", label: "Fotocelda dañada" },
  { value: "Cables dañados", label: "Cables dañados" },
];

/** Etiqueta legible de un tipo de daño ("N/D" si no hay). */
export function etiquetaTipoDano(tipoDano: string | null | undefined) {
  return TIPOS_DANO.find((t) => t.value === tipoDano)?.label ?? "N/D";
}

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
