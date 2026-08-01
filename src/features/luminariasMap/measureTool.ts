import L from "leaflet";

export type Medidor = {
  activar: () => void;
  detener: () => void;
  limpiar: () => void;
  destruir: () => void;
};

function formatearDistancia(metros: number) {
  if (metros >= 1000) return `${(metros / 1000).toFixed(2)} km`;
  return `${Math.round(metros)} m`;
}

/**
 * Herramienta de medición de distancia: cada click sobre el mapa agrega un vértice,
 * dibuja una línea entre los puntos y reporta la distancia acumulada vía `onCambiar`.
 */
export function crearMedidor(map: L.Map, onCambiar: (texto: string | null) => void): Medidor {
  const layer = L.layerGroup().addTo(map);
  let puntos: L.LatLng[] = [];
  let polyline: L.Polyline | null = null;
  let activo = false;

  function recalcular() {
    let total = 0;
    for (let i = 1; i < puntos.length; i++) {
      total += puntos[i - 1].distanceTo(puntos[i]);
    }
    onCambiar(puntos.length > 0 ? formatearDistancia(total) : null);
  }

  function onClick(e: L.LeafletMouseEvent) {
    puntos.push(e.latlng);

    L.circleMarker(e.latlng, {
      radius: 4,
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: 1,
      weight: 2,
    }).addTo(layer);

    if (puntos.length > 1) {
      if (!polyline) {
        polyline = L.polyline(puntos, { color: "#f59e0b", weight: 3, dashArray: "6,6" }).addTo(layer);
      } else {
        polyline.setLatLngs(puntos);
      }
    }

    recalcular();
  }

  function activar() {
    limpiar();
    activo = true;
    map.doubleClickZoom.disable();
    map.getContainer().style.cursor = "crosshair";
    map.on("click", onClick);
  }

  function detener() {
    if (!activo) return;
    activo = false;
    map.doubleClickZoom.enable();
    map.getContainer().style.cursor = "";
    map.off("click", onClick);
  }

  function limpiar() {
    detener();
    layer.clearLayers();
    puntos = [];
    polyline = null;
    onCambiar(null);
  }

  function destruir() {
    detener();
    layer.remove();
  }

  return { activar, detener, limpiar, destruir };
}
