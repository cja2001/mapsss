import { supabase } from "./supabaseClient";
import type { Luminaria } from "./types";

export type MutacionPendiente =
  | { id: string; tipo: "update"; creada: number; luminariaId: number; patch: Partial<Luminaria> }
  | { id: string; tipo: "insert"; creada: number; row: Partial<Luminaria> }
  | { id: string; tipo: "viaUpdate"; creada: number; viaId: number; patch: Record<string, string> };

const CLAVE_STORAGE = "luminarias_cola_offline";

function leerCola(): MutacionPendiente[] {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    return raw ? (JSON.parse(raw) as MutacionPendiente[]) : [];
  } catch {
    return [];
  }
}

function guardarCola(cola: MutacionPendiente[]) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(cola));
  listeners.forEach((listener) => listener(cola.length));
}

const listeners = new Set<(pendientes: number) => void>();

/** Se llama con el nº de mutaciones pendientes al suscribirse y cada vez que cambia. */
export function suscribirseColaPendiente(listener: (pendientes: number) => void) {
  listeners.add(listener);
  listener(leerCola().length);
  return () => {
    listeners.delete(listener);
  };
}

export function encolarMutacion(mutacion: Omit<MutacionPendiente, "id" | "creada">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cola = leerCola();
  cola.push({ ...mutacion, id, creada: Date.now() } as MutacionPendiente);
  guardarCola(cola);
}

function quitarMutacion(id: string) {
  guardarCola(leerCola().filter((m) => m.id !== id));
}

/** Detecta una falla de red (sin señal) en vez de un error real de Supabase (validación, permisos, etc). */
export function esErrorDeRed(err: unknown) {
  if (!navigator.onLine) return true;
  return err instanceof TypeError && /fetch/i.test(err.message);
}

let sincronizando = false;

/**
 * Reenvía las mutaciones pendientes a Supabase en orden. Se detiene en el
 * primer error de red (probablemente seguimos sin señal real) mientras deja
 * intactas las que aún no se han podido enviar. Devuelve cuántas se aplicaron
 * con éxito, para que quien llama sepa si vale la pena recargar los datos.
 */
export async function sincronizarCola(): Promise<number> {
  if (sincronizando) return 0;
  sincronizando = true;
  let aplicadas = 0;

  try {
    for (const mutacion of leerCola()) {
      try {
        if (mutacion.tipo === "update") {
          const { error } = await supabase
            .from("luminarias")
            .update(mutacion.patch)
            .eq("id", mutacion.luminariaId);
          if (error) throw error;
        } else if (mutacion.tipo === "viaUpdate") {
          const { error } = await supabase
            .from("vias_san_marcos")
            .update(mutacion.patch)
            .eq("id", mutacion.viaId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("luminarias").insert([mutacion.row]);
          if (error) throw error;
        }
        quitarMutacion(mutacion.id);
        aplicadas++;
      } catch (err) {
        if (esErrorDeRed(err)) break;
        // Error real (no de red): se descarta para no bloquear el resto de la cola.
        console.error("No se pudo sincronizar una mutación pendiente:", err);
        quitarMutacion(mutacion.id);
      }
    }
  } finally {
    sincronizando = false;
  }

  return aplicadas;
}
