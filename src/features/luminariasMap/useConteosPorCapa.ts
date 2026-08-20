import { useEffect, useState } from "react";
import type { CapaExtraConfig } from "./colorConfig";

export type CapaContable = Pick<CapaExtraConfig, "id" | "label" | "url" | "leyendaPorPropiedad">;

/** Descarga y cuenta, por cada capa que declare `leyendaPorPropiedad`, cuántos features caen en cada ítem de su leyenda. */
export function useConteosPorCapa(capas: CapaContable[]) {
  const [conteos, setConteos] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    let cancelado = false;

    capas
      .filter((capa) => capa.leyendaPorPropiedad)
      .forEach((capa) => {
        fetch(capa.url)
          .then((r) => {
            if (!r.ok) throw new Error(`No se encontró ${capa.url}`);
            return r.json();
          })
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
