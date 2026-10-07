import type { Luminaria } from "../../lib/types";

export type DistritoResumen = { clave: string; nombre: string; total: number };

/** Valor del selector que significa "sin filtrar por distrito". */
export const TODOS_LOS_DISTRITOS = "";
const CLAVE_SIN_DISTRITO = "(sin distrito)";

/** Clave para comparar distritos sin que afecten mayúsculas ni espacios sobrantes. */
export function claveDistrito(distrito: string | null | undefined) {
  return (distrito ?? "").trim().toLowerCase() || CLAVE_SIN_DISTRITO;
}

/** Nombre para mostrar: cada palabra con mayúscula inicial ("san marcos" → "San Marcos"). */
export function nombreDistrito(distrito: string | null | undefined) {
  const limpio = (distrito ?? "").trim();
  if (!limpio) return "Sin distrito";
  return limpio
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) => (palabra === "de" ? palabra : palabra[0].toUpperCase() + palabra.slice(1)))
    .join(" ");
}

/** Distritos presentes en los datos, del que tiene más luminarias al que tiene menos. */
export function listarDistritos(luminarias: Luminaria[]): DistritoResumen[] {
  const porClave = new Map<string, DistritoResumen>();
  for (const luminaria of luminarias) {
    const clave = claveDistrito(luminaria.distrito);
    const actual = porClave.get(clave);
    if (actual) actual.total++;
    else porClave.set(clave, { clave, nombre: nombreDistrito(luminaria.distrito), total: 1 });
  }
  return [...porClave.values()].sort((a, b) => b.total - a.total);
}

export function filtrarPorDistrito(luminarias: Luminaria[], clave: string) {
  if (clave === TODOS_LOS_DISTRITOS) return luminarias;
  return luminarias.filter((luminaria) => claveDistrito(luminaria.distrito) === clave);
}

/** Cuenta, por cada distrito, cuántas luminarias cumplen `condicion` (todas, si no se indica). */
export function contarPorDistrito(
  luminarias: Luminaria[],
  distritos: DistritoResumen[],
  color: string,
  condicion?: (luminaria: Luminaria) => boolean
) {
  const conteo = new Map<string, number>();
  for (const luminaria of luminarias) {
    if (condicion && !condicion(luminaria)) continue;
    const clave = claveDistrito(luminaria.distrito);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }
  return distritos.map((d) => ({
    key: d.clave,
    label: d.nombre,
    color,
    valor: conteo.get(d.clave) ?? 0,
  }));
}
