import { supabase } from "../../lib/supabaseClient";
import type { CambioTipoLuminaria } from "../../lib/types";

/** Cambios de tipo de una luminaria, del más reciente al más antiguo. Los registra un trigger en la base de datos. */
export async function cargarHistorialTipo(luminariaId: number): Promise<CambioTipoLuminaria[]> {
  const { data, error } = await supabase
    .from("luminarias_historial_tipo")
    .select("id, luminaria_id, tipo_anterior, tipo_nuevo, cambiado_por_email, cambiado_en")
    .eq("luminaria_id", luminariaId)
    .order("cambiado_en", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CambioTipoLuminaria[];
}
