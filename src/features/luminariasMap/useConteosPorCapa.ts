import { useEffect, useState } from "react";
import type { CapaExtraConfig } from "./colorConfig";

/** Los datos mínimos de una capa que hacen falta para contarla. */
export type CapaContable = Pick<
  CapaExtraConfig,
  "id" | "label" | "url" | "cargarDatos" | "leyendaPorPropiedad"
>;

/** Descarga y cuenta, por cada capa que declare `leyendaPorPropiedad`, cuántos features caen en cada ítem de su leyenda. */
export function useConteosPorCapa(capas: CapaContable[]) {
  const [conteos, setConteos] = useState<Record<string, Record<string, number>>>({});

  // Por cada capa: descarga sus datos y cuenta cuántos elementos caen en cada ítem de la leyenda.
  useEffect(() => {
    let cancelado = false;

    capas
      .filter((capa) => capa.leyendaPorPropiedad)
      .forEach((capa) => {
        // Origen de los datos: función propia (Supabase) o archivo GeoJSON.
        const cargar = capa.cargarDatos
          ? capa.cargarDatos()
          : fetch(capa.url!).then((r) => {
              if (!r.ok) throw new Error(`No se encontró ${capa.url}`);
              return r.json();
            });

        // Al llegar los datos se cuentan y se guardan; los errores solo se registran en consola.
        cargar
          .then((data: GeoJSON.FeatureCollection) => {
            if (cancelado) return;
            const conteo: Record<string, number> = {};
            for (const feature of data.features) {
              const label = capa.leyendaPorPropiedad!(feature.properties ?? null);
              conteo[label] = (conteo[label] ?? 0) + 1;
            }
            setConteos((prev) => ({ ...prev, [capa.id]: conteo }));
          })
          .catch((err) => console.error(`Error al contar la capa "${capa.label}":`, err));
      });

    return () => {
      cancelado = true;
    };
  }, [capas]);

  return conteos;
}
