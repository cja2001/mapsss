// Capa de distritos: contornos y nombres, siempre visibles y sin capturar clics.
import L from "leaflet";
import { asociarPuntoEtiqueta, reaplicarPuntoEtiqueta } from "./polygonLabelPoint";

// Archivo de distritos y color del contorno según el mapa base.
const GEOJSON_URL = "/distritos-sss.geojson";
const COLOR_SATELITAL = "white";
const COLOR_NORMAL = "#1e3a8a";

/** Descarga los distritos, los dibuja con su nombre y adapta el color al cambiar de mapa base. */
export async function cargarDistritos(map: L.Map, satelital: L.TileLayer, isCancelado: () => boolean) {
  const response = await fetch(GEOJSON_URL);
  if (!response.ok) throw new Error("No se encontró el archivo de distritos");
  const data = await response.json();

  // Si el mapa se desmontó mientras cargaba, no se dibuja nada.
  if (isCancelado()) return;

  const isSatelital = map.hasLayer(satelital);

  // Contornos sin relleno, con el nombre del distrito como etiqueta permanente.
  const layer = L.geoJSON(data, {
    interactive: false,
    style: {
      color: isSatelital ? COLOR_SATELITAL : COLOR_NORMAL,
      weight: 2,
      opacity: 0.8,
      fill: false,
    },
    onEachFeature: (feature, featureLayer) => {
      if (feature.properties && feature.properties.NOMBRE) {
        featureLayer.bindTooltip(feature.properties.NOMBRE, {
          permanent: true,
          direction: "center",
          className: "distrito-label",
        });
        asociarPuntoEtiqueta(featureLayer, feature.geometry);
      }
    },
  }).addTo(map);

  // Leaflet reposiciona los tooltips al centroide de la bbox al agregar la capa
  // al mapa (arriba), pisando el punto centrado calculado en onEachFeature.
  layer.eachLayer(reaplicarPuntoEtiqueta);

  // Blanco sobre la vista satelital, azul oscuro sobre el mapa normal.
  map.on("baselayerchange", (e: L.LayersControlEvent) => {
    layer.setStyle({ color: e.name === "Satelital" ? COLOR_SATELITAL : COLOR_NORMAL });
  });

  return layer;
}
