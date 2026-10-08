// Capas GeoJSON adicionales del mapa (colonias, parcelario, calles): estilo, etiquetas, popups y carga.
import L from "leaflet";
import type { CapaExtraConfig } from "./colorConfig";
import { asociarPuntoEtiqueta, reaplicarPuntoEtiqueta } from "./polygonLabelPoint";
import { buildCapaPopupContent } from "./capaPopup";

/** Devuelve la función que Leaflet llama por cada elemento de la capa para ponerle etiqueta y popup. */
function buildOnEachFeature(capa: CapaExtraConfig) {
  return (feature: GeoJSON.Feature, layer: L.Layer) => {
    const props = feature.properties ?? {};

    // Etiqueta permanente con el nombre, centrada dentro del polígono.
    if (capa.tooltipField && props[capa.tooltipField]) {
      layer.bindTooltip(String(props[capa.tooltipField]), {
        permanent: true,
        direction: "center",
        className: "colonia-label",
      });
      asociarPuntoEtiqueta(layer, feature.geometry);
    }

    // Popup editable (si la capa lo permite) o popup de solo lectura.
    if (capa.camposEditables?.length && capa.guardarEdicion) {
      const contenido = buildCapaPopupContent(props, capa, async (cambios) => {
        await capa.guardarEdicion!(props, cambios);
        feature.properties = { ...feature.properties, ...cambios };
        if (capa.colorPorPropiedad && "setStyle" in layer) {
          (layer as L.Path).setStyle({ color: capa.colorPorPropiedad(feature.properties) });
        }
      });
      layer.bindPopup(contenido);
    } else if (capa.popupFields?.length) {
      const html = capa.popupFields
        .map(({ label, propKey }) => `<b>${label}:</b> ${props[propKey] ?? "N/D"}`)
        .join("<br>");
      layer.bindPopup(html);
    }
  };
}

/** Descarga los datos de una capa: usa `cargarDatos` si está definido (ej. una tabla de Supabase), si no hace `fetch(url)`. */
async function cargarDatosCapa(capa: CapaExtraConfig): Promise<GeoJSON.GeoJsonObject> {
  if (capa.cargarDatos) return capa.cargarDatos();

  const r = await fetch(capa.url!);
  if (!r.ok) throw new Error(`No se encontró ${capa.url}`);
  return r.json();
}

/** Reaplica el punto de etiqueta centrado a cada polígono de `layer` (ver polygonLabelPoint.ts). */
function centrarEtiquetas(layer: L.GeoJSON) {
  layer.eachLayer(reaplicarPuntoEtiqueta);
}

/**
 * Registra una capa GeoJSON adicional en el control de capas.
 * Si `lazy` es true, el archivo solo se descarga la primera vez que el usuario la activa
 * (usado para el parcelario, que pesa varios MB).
 */
export function agregarCapaExtra(
  map: L.Map,
  controlCapas: L.Control.Layers,
  capa: CapaExtraConfig,
  isCancelado: () => boolean
) {
  // Estilo: color fijo, o calculado por elemento según sus propiedades.
  const style: L.PathOptions | L.StyleFunction = capa.colorPorPropiedad
    ? (feature) => ({
        color: capa.colorPorPropiedad!(feature?.properties ?? null),
        weight: capa.weight,
        fillOpacity: capa.fillOpacity,
      })
    : { color: capa.color, weight: capa.weight, fillOpacity: capa.fillOpacity };
  const onEachFeature = buildOnEachFeature(capa);
  const interactive = capa.interactive ?? true;
  const tieneEtiquetas = !!capa.tooltipField;

  // Carga inmediata: se descarga ya y se registra en el control de capas.
  if (!capa.lazy) {
    cargarDatosCapa(capa)
      .then((data) => {
        if (isCancelado()) return;
        const layer = L.geoJSON(data, { style, onEachFeature, interactive });
        if (capa.visiblePorDefecto) layer.addTo(map);
        controlCapas.addOverlay(layer, capa.label);
        if (tieneEtiquetas) {
          centrarEtiquetas(layer);
          // Leaflet reposiciona los tooltips al centroide de la bbox cada vez que
          // la capa vuelve a agregarse al mapa (p. ej. al activar la casilla),
          // así que hay que recentrar cada vez que eso ocurre.
          map.on("overlayadd", (e: L.LayersControlEvent) => {
            if (e.name === capa.label) centrarEtiquetas(layer);
          });
        }
      })
      .catch((err) => console.error(`Error al cargar la capa "${capa.label}":`, err));
    return;
  }

  // Carga diferida: la capa se registra vacía y los datos se piden al activarla.
  const layer = L.geoJSON(undefined, { style, onEachFeature, interactive });
  controlCapas.addOverlay(layer, capa.label);
  if (tieneEtiquetas) {
    map.on("overlayadd", (e: L.LayersControlEvent) => {
      if (e.name === capa.label) centrarEtiquetas(layer);
    });
  }

  // Descarga los datos una sola vez; si falla, permite reintentar.
  let cargado = false;
  function cargar() {
    if (cargado || isCancelado()) return;
    cargado = true;

    cargarDatosCapa(capa)
      .then((data) => {
        if (isCancelado()) return;
        layer.addData(data);
        if (tieneEtiquetas) centrarEtiquetas(layer);
      })
      .catch((err) => {
        cargado = false;
        console.error(`Error al cargar la capa "${capa.label}":`, err);
      });
  }

  // Si debe verse al abrir, se añade y se carga de inmediato.
  if (capa.visiblePorDefecto) {
    layer.addTo(map);
    cargar();
  }

  // En cualquier caso, se carga cuando el usuario la activa.
  map.on("overlayadd", (e: L.LayersControlEvent) => {
    if (e.name === capa.label) cargar();
  });
}
