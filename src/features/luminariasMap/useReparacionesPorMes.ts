import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/** Un mes del gráfico con su número de reparaciones. */
export type MesReparaciones = { clave: string; label: string; valor: number };
/** Una reparación: qué luminaria y cuándo. */
export type Reparacion = { luminariaId: number; fecha: string };

// Cuántos meses se muestran y tamaño de página de las consultas.
const MESES_A_MOSTRAR = 12;
const PAGE_SIZE = 1000;
/** Estados desde los que pasar a "buena" cuenta como una reparación. */
const ESTADOS_POR_REPARAR = ["dañada", "danada", "mantenimiento"];

/** Clave "AAAA-MM" de una fecha, para agrupar por mes. */
function claveMes(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Primer día del mes más antiguo que se muestra (hace 11 meses). */
function inicioDelPeriodo() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() - (MESES_A_MOSTRAR - 1), 1);
}

/** Los últimos 12 meses (el actual incluido), del más antiguo al más reciente, con el conteo en cero. */
function mesesVacios(): MesReparaciones[] {
  const inicio = inicioDelPeriodo();
  return Array.from({ length: MESES_A_MOSTRAR }, (_, i) => {
    const fecha = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
    const mes = fecha.toLocaleDateString("es-SV", { month: "short" }).replace(".", "");
    return {
      clave: claveMes(fecha),
      label: `${mes} ${String(fecha.getFullYear()).slice(2)}`,
      valor: 0,
    };
  });
}

/**
 * Agrupa las reparaciones en los últimos 12 meses. Con `incluir` se cuentan solo
 * las de ciertas luminarias (p. ej. las de un distrito).
 */
export function contarReparacionesPorMes(
  reparaciones: Reparacion[],
  incluir?: (luminariaId: number) => boolean
): MesReparaciones[] {
  const meses = mesesVacios();
  const porClave = new Map(meses.map((m) => [m.clave, m]));
  for (const reparacion of reparaciones) {
    if (incluir && !incluir(reparacion.luminariaId)) continue;
    const mes = porClave.get(claveMes(new Date(reparacion.fecha)));
    if (mes) mes.valor++;
  }
  return meses;
}

/** Descarga, por páginas, los cambios a "buena" desde la fecha indicada y conserva los que eran reparaciones. */
async function cargarReparaciones(desde: Date): Promise<Reparacion[]> {
  const reparaciones: Reparacion[] = [];
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("luminarias_historial_estado")
      .select("luminaria_id, estado_anterior, cambiado_en")
      .ilike("estado_nuevo", "buena")
      .gte("cambiado_en", desde.toISOString())
      .order("cambiado_en", { ascending: true })
      .range(inicio, inicio + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    // Solo cuenta como reparación si antes estaba dañada o en mantenimiento.
    for (const fila of data) {
      const anterior = (fila.estado_anterior ?? "").toLowerCase().trim();
      if (ESTADOS_POR_REPARAR.includes(anterior)) {
        reparaciones.push({ luminariaId: fila.luminaria_id, fecha: fila.cambiado_en });
      }
    }

    if (data.length < PAGE_SIZE) break;
    inicio += PAGE_SIZE;
  }

  return reparaciones;
}

/**
 * Carga las reparaciones de los últimos 12 meses. Una reparación es un cambio
 * de estado de "dañada" o "mantenimiento" a "buena", que un trigger registra en
 * `luminarias_historial_estado`.
 */
export function useReparaciones() {
  // Reparaciones cargadas, estado de carga y error.
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga única al montar; si el componente se desmonta antes, se ignora la respuesta.
  useEffect(() => {
    let cancelado = false;

    cargarReparaciones(inicioDelPeriodo())
      .then((filas) => {
        if (cancelado) return;
        setReparaciones(filas);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("Error al cargar el historial de reparaciones:", err);
        setError(
          navigator.onLine
            ? "No se pudo cargar el historial de reparaciones."
            : "El historial de reparaciones no está disponible sin conexión."
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { reparaciones, cargando, error };
}
