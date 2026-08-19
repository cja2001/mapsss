import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Luminaria } from "../../lib/types";
import {
  encolarMutacion,
  esErrorDeRed,
  sincronizarCola,
  suscribirseColaPendiente,
} from "../../lib/offlineQueue";

const PAGE_SIZE = 1000;

async function fetchAllLuminarias(selectColumns: string): Promise<Luminaria[]> {
  let todos: Luminaria[] = [];
  let desde = 0;
  let continuar = true;

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

export function useLuminarias(selectColumns: string) {
  const [data, setData] = useState<Luminaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState(0);

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

  useEffect(() => {
    reload();
  }, [reload]);

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

  async function updateLuminaria(id: number, patch: Partial<Luminaria>) {
    if (!navigator.onLine) {
      encolarMutacion({ tipo: "update", luminariaId: id, patch });
      setData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
      return;
    }

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

  async function insertLuminaria(row: Partial<Luminaria>) {
    if (!navigator.onLine) {
      encolarMutacion({ tipo: "insert", row });
      setData((prev) => [...prev, filaOptimista(row)]);
      return;
    }

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
    ...row,
  };
}
