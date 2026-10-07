import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export type MesReparaciones = { clave: string; label: string; valor: number };

const MESES_A_MOSTRAR = 12;
const PAGE_SIZE = 1000;
/** Estados desde los que pasar a "buena" cuenta como una reparación. */
const ESTADOS_POR_REPARAR = ["dañada", "danada", "mantenimiento"];

function claveMes(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

/** Los últimos 12 meses (el actual incluido), del más antiguo al más reciente, con el conteo en cero. */
function mesesVacios(): MesReparaciones[] {
  const hoy = new Date();
  return Array.from({ length: MESES_A_MOSTRAR }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (MESES_A_MOSTRAR - 1 - i), 1);
    const mes = fecha.toLocaleDateString("es-SV", { month: "short" }).replace(".", "");
    return {
      clave: claveMes(fecha),
      label: `${mes} ${String(fecha.getFullYear()).slice(2)}`,
      valor: 0,
    };
  });
}

async function cargarFechasDeReparacion(desde: Date): Promise<string[]> {
  const fechas: string[] = [];
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("luminarias_historial_estado")
      .select("estado_anterior, cambiado_en")
      .ilike("estado_nuevo", "buena")
      .gte("cambiado_en", desde.toISOString())
      .order("cambiado_en", { ascending: true })
      .range(inicio, inicio + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const fila of data) {
      const anterior = (fila.estado_anterior ?? "").toLowerCase().trim();
      if (ESTADOS_POR_REPARAR.includes(anterior)) fechas.push(fila.cambiado_en);
    }

    if (data.length < PAGE_SIZE) break;
    inicio += PAGE_SIZE;
  }

  return fechas;
}

/**
 * Cuenta las luminarias reparadas en cada uno de los últimos 12 meses. Una
 * reparación es un cambio de estado de "dañada" o "mantenimiento" a "buena",
 * que un trigger registra en `luminarias_historial_estado`.
 */
export function useReparacionesPorMes() {
  const [meses, setMeses] = useState<MesReparaciones[]>(mesesVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    const base = mesesVacios();
    const [anio, mes] = base[0].clave.split("-").map(Number);

    cargarFechasDeReparacion(new Date(anio, mes - 1, 1))
      .then((fechas) => {
        if (cancelado) return;
        const porClave = new Map(base.map((m) => [m.clave, m]));
        for (const iso of fechas) {
          const item = porClave.get(claveMes(new Date(iso)));
          if (item) item.valor++;
        }
        setMeses(base);
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

  return { meses, cargando, error };
}
