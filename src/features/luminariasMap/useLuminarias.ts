import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Luminaria } from "../../lib/types";

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

  async function updateLuminaria(id: number, patch: Partial<Luminaria>) {
    const { error } = await supabase.from("luminarias").update(patch).eq("id", id);
    if (error) throw error;
    await reload();
  }

  async function insertLuminaria(row: Partial<Luminaria>) {
    const { error } = await supabase.from("luminarias").insert([row]);
    if (error) throw error;
    await reload();
  }

  return { data, loading, error, reload, updateLuminaria, insertLuminaria };
}
