/** Texto legible de un error. Supabase devuelve objetos con `message` que no son instancias de Error. */
export function mensajeDeError(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const { message, details, hint } = err as { message?: unknown; details?: unknown; hint?: unknown };
    return [message, details, hint].filter((t) => typeof t === "string" && t).join(" · ");
  }
  return String(err);
}
