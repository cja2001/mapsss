// Lectura del historial de cambios de una luminaria (tipo y potencia) desde Supabase.
import { supabase } from "../../lib/supabaseClient";
import type { CambioLuminaria } from "../../lib/types";

// Campos comunes a las filas de ambas tablas de historial.
type FilaHistorial = {
  id: number;
  cambiado_por_email: string | null;
  cambiado_en: string;
};

/** Cambios de tipo de una luminaria, convertidos al formato común. */
async function cargarCambiosDeTipo(luminariaId: number): Promise<CambioLuminaria[]> {
  const { data, error } = await supabase
    .from("luminarias_historial_tipo")
    .select("id, tipo_anterior, tipo_nuevo, cambiado_por_email, cambiado_en")
    .eq("luminaria_id", luminariaId);

  if (error) throw error;
  return (data ?? []).map(
    (fila: FilaHistorial & { tipo_anterior: string | null; tipo_nuevo: string | null }) => ({
      id: `tipo-${fila.id}`,
      campo: "tipo",
      anterior: fila.tipo_anterior,
      nuevo: fila.tipo_nuevo,
      cambiado_por_email: fila.cambiado_por_email,
      cambiado_en: fila.cambiado_en,
    })
  );
}

/** Cambios de potencia de una luminaria, convertidos al formato común. */
async function cargarCambiosDePotencia(luminariaId: number): Promise<CambioLuminaria[]> {
  const { data, error } = await supabase
    .from("luminarias_historial_potencia")
    .select("id, potencia_anterior, potencia_nueva, cambiado_por_email, cambiado_en")
    .eq("luminaria_id", luminariaId);

  if (error) throw error;
  return (data ?? []).map(
    (
      fila: FilaHistorial & { potencia_anterior: string | null; potencia_nueva: string | null }
    ) => ({
      id: `potencia-${fila.id}`,
      campo: "potencia",
      anterior: fila.potencia_anterior,
      nuevo: fila.potencia_nueva,
      cambiado_por_email: fila.cambiado_por_email,
      cambiado_en: fila.cambiado_en,
    })
  );
}

/**
 * Cambios de tipo y de potencia de una luminaria, del más reciente al más
 * antiguo. Los registran triggers en la base de datos. Si uno de los dos
 * historiales no se puede leer, se devuelve el otro; solo falla si fallan ambos.
 */
export async function cargarHistorialCambios(luminariaId: number): Promise<CambioLuminaria[]> {
  // Se consultan ambos historiales a la vez, sin que el fallo de uno impida leer el otro.
  const resultados = await Promise.allSettled([
    cargarCambiosDeTipo(luminariaId),
    cargarCambiosDePotencia(luminariaId),
  ]);

  // Los fallos se registran en consola; solo se lanza error si fallaron los dos.
  const fallidos = resultados.filter((r) => r.status === "rejected");
  fallidos.forEach((r) => console.error("Error al cargar parte del historial:", r.reason));
  if (fallidos.length === resultados.length) throw fallidos[0].reason;

  // Se unen y se ordenan del más reciente al más antiguo.
  return resultados
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => b.cambiado_en.localeCompare(a.cambiado_en));
}
