import L from "leaflet";
import type { CapaExtraConfig } from "./colorConfig";

function buildOnEachFeature(capa: CapaExtraConfig) {
  return (feature: GeoJSON.Feature, layer: L.Layer) => {
    const props = feature.properties ?? {};

    if (capa.tooltipField && props[capa.tooltipField]) {
      layer.bindTooltip(String(props[capa.tooltipField]), {
        permanent: true,
        direction: "center",
        className: "distrito-label",
      });
    }

    if (capa.popupFields?.length) {
      const html = capa.popupFields
        .map(({ label, propKey }) => `<b>${label}:</b> ${props[propKey] ?? "N/D"}`)
        .join("<br>");
      layer.bindPopup(html);
    }
  };
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
  isCancelado: () => boolean,
  onLayerReady?: (layer: L.GeoJSON) => void
) {
  const style = { color: capa.color, weight: capa.weight, fillOpacity: capa.fillOpacity };
  const onEachFeature = buildOnEachFeature(capa);
  const interactive = capa.interactive ?? true;

  if (!capa.lazy) {
    fetch(capa.url)
      .then((r) => {
        if (!r.ok) throw new Error(`No se encontró ${capa.url}`);
        return r.json();
      })
      .then((data) => {
        if (isCancelado()) return;
        const layer = L.geoJSON(data, { style, onEachFeature, interactive });
        if (capa.visiblePorDefecto) layer.addTo(map);
        controlCapas.addOverlay(layer, capa.label);
        onLayerReady?.(layer);
      })
      .catch((err) => console.error(`Error al cargar la capa "${capa.label}":`, err));
    return;
  }

  const layer = L.geoJSON(undefined, { style, onEachFeature, interactive });
  onLayerReady?.(layer);

  let cargado = false;
  function cargar() {
    if (cargado || isCancelado()) return;
    cargado = true;

    fetch(capa.url)
      .then((r) => {
        if (!r.ok) throw new Error(`No se encontró ${capa.url}`);
        return r.json();
      })
      .then((data: GeoJSON.GeoJsonObject) => {
        if (isCancelado()) return;
        layer.addData(data);
      })
      .catch((err) => {
        cargado = false;
        console.error(`Error al cargar la capa "${capa.label}":`, err);
      });
  }

  if (capa.visiblePorDefecto) {
    layer.addTo(map);
    cargar();
  }

  controlCapas.addOverlay(layer, capa.label);
  map.on("overlayadd", (e: L.LayersControlEvent) => {
    if (e.name === capa.label) cargar();
  });
}
