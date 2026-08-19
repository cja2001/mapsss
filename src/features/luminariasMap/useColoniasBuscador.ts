import { useCallback, useEffect, useState } from "react";
import L, { type LatLngBounds } from "leaflet";

export type ColoniaSugerencia = {
  nombre: string;
  bounds: LatLngBounds;
  feature: GeoJSON.Feature;
};

const URL_COLONIAS = "/colonias-san-marcos.geojson";
const CAMPO_NOMBRE = "text_1";

/** Quita diacríticos (tildes) comparando el código Unicode de cada carácter tras NFD. */
function normalizar(texto: string) {
  const sinAcentos = Array.from(texto.normalize("NFD"))
    .filter((caracter) => {
      const codigo = caracter.codePointAt(0) ?? 0;
      return codigo < 0x300 || codigo > 0x36f;
    })
    .join("");
  return sinAcentos.toLowerCase().trim();
}

/** Carga las colonias una vez y expone una búsqueda por nombre (sin acentos, coincidencia parcial). */
export function useColoniasBuscador() {
  const [colonias, setColonias] = useState<ColoniaSugerencia[]>([]);

  useEffect(() => {
    let cancelado = false;

    fetch(URL_COLONIAS)
      .then((r) => {
        if (!r.ok) throw new Error("No se encontró el archivo de colonias");
        return r.json();
      })
      .then((data: GeoJSON.FeatureCollection) => {
        if (cancelado) return;

        const lista: ColoniaSugerencia[] = [];
        for (const feature of data.features) {
          const nombre = feature.properties?.[CAMPO_NOMBRE];
          if (!nombre || !feature.geometry) continue;

          const bounds = L.geoJSON(feature).getBounds();
          if (!bounds.isValid()) continue;

          lista.push({ nombre: String(nombre), bounds, feature });
        }
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        setColonias(lista);
      })
      .catch((err) => console.error("Error al cargar colonias para búsqueda:", err));

    return () => {
      cancelado = true;
    };
  }, []);

  const buscarSugerencias = useCallback(
    (texto: string, limite = 6): ColoniaSugerencia[] => {
      const q = normalizar(texto);
      if (!q) return [];
      return colonias.filter((c) => normalizar(c.nombre).includes(q)).slice(0, limite);
    },
    [colonias]
  );

  return { buscarSugerencias };
}
