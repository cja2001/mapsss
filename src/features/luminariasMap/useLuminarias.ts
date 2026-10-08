import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Luminaria } from "../../lib/types";
import {
  encolarMutacion,
  esErrorDeRed,
  sincronizarCola,
  suscribirseColaPendiente,
} from "../../lib/offlineQueue";

// Supabase devuelve como máximo 1000 filas por consulta, así que se pide por páginas.
const PAGE_SIZE = 1000;

/** Descarga todas las luminarias, página por página, con las columnas indicadas. */
async function fetchAllLuminarias(selectColumns: string): Promise<Luminaria[]> {
  let todos: Luminaria[] = [];
  let desde = 0;
  let continuar = true;

  // Pide páginas hasta recibir una incompleta, que es la última.
  while (continuar) {
    const { data, error } = await supabase
      .from("luminarias")
      .select(selectColumns)
      .range(desde, desde + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    todos = todos.concat(data as unknown as Luminaria[]);
    continuar = data.length === PAGE_SIZE;
    desde += PAGE_SIZE;
  }

  return todos;
}

/** Hook de datos del mapa: carga las luminarias y permite editarlas y añadirlas, también sin conexión. */
export function useLuminarias(selectColumns: string) {
  // Luminarias cargadas, estado de carga, error y cambios pendientes de sincronizar.
  const [data, setData] = useState<Luminaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState(0);

  // Vuelve a descargar todas las luminarias.
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAllLuminarias(selectColumns);
      setData(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  }, [selectColumns]);

  // Carga inicial (y recarga si cambian las columnas pedidas).
  useEffect(() => {
    reload();
  }, [reload]);

  // Mantiene actualizado el número de cambios pendientes de enviar.
  useEffect(() => suscribirseColaPendiente(setPendientes), []);

  // Reintenta enviar los cambios en espera al recuperar señal (y una vez al
  // montar, por si quedaron pendientes de una sesión offline anterior).
  useEffect(() => {
    async function intentarSincronizar() {
      const aplicadas = await sincronizarCola();
      if (aplicadas > 0) await reload();
    }

    if (navigator.onLine) intentarSincronizar();
    window.addEventListener("online", intentarSincronizar);
    return () => window.removeEventListener("online", intentarSincronizar);
  }, [reload]);

  // Actualiza campos de una luminaria. Sin conexión, encola el cambio y lo refleja en pantalla.
  async function updateLuminaria(id: number, patch: Partial<Luminaria>) {
    if (!navigator.onLine) {
      encolarMutacion({ tipo: "update", luminariaId: id, patch });
      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
      return;
    }

    // Con conexión: se guarda y se recargan los datos; si falla la red, se encola.
    try {
      const { error } = await supabase.from("luminarias").update(patch).eq("id", id);
      if (error) throw error;
      await reload();
    } catch (err) {
      if (!esErrorDeRed(err)) throw err;
      encolarMutacion({ tipo: "update", luminariaId: id, patch });
      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    }
  }

  // Añade una luminaria. Sin conexión, encola el alta y muestra una fila temporal.
  async function insertLuminaria(row: Partial<Luminaria>) {
    if (!navigator.onLine) {
      encolarMutacion({ tipo: "insert", row });
      setData((prev) => [...prev, filaOptimista(row)]);
      return;
    }

    // Con conexión: se inserta y se recargan los datos; si falla la red, se encola.
    try {
      const { error } = await supabase.from("luminarias").insert([row]);
      if (error) throw error;
      await reload();
    } catch (err) {
      if (!esErrorDeRed(err)) throw err;
      encolarMutacion({ tipo: "insert", row });
      setData((prev) => [...prev, filaOptimista(row)]);
    }
  }

  return { data, loading, error, pendientes, reload, updateLuminaria, insertLuminaria };
}

/** Fila temporal para mostrar de inmediato una luminaria añadida sin conexión; `reload()` la reemplaza por la real al sincronizar. */
function filaOptimista(row: Partial<Luminaria>): Luminaria {
  return {
    id: -Date.now(),
    lat: null,
    lng: null,
    tipo: null,
    potencia: null,
    estado: null,
    distrito: null,
    tasada: false,
    servicio: null,
    ...row,
  };
}
