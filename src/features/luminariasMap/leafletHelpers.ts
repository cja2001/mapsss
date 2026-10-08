// Utilidades de Leaflet para el mapa: capas base, tamaño de los puntos y controles propios.
import L from "leaflet";

/** Crea las dos capas base del mapa: normal y satelital. */
export function crearCapasBase() {
  // Tiles de Google (endpoint no oficial, sin API key). No pasa por Google Maps
  // Platform: úsese como solución rápida, no como integración a largo plazo.
  const subdomains = ["mt0", "mt1", "mt2", "mt3"];

  // Mapa normal (calles).
  const osm = L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    subdomains,
    maxZoom: 24,
    maxNativeZoom: 20,
    attribution: "&copy; Google",
  });

  // Vista satelital (híbrida, con nombres de calles).
  const satelital = L.tileLayer("https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
    subdomains,
    maxZoom: 24,
    maxNativeZoom: 20,
    attribution: "&copy; Google",
  });

  return { osm, satelital };
}

/** Radio en píxeles de los puntos de luminarias según el nivel de zoom: más cerca, más grandes. */
export function obtenerRadioZoom(zoom: number) {
  if (zoom >= 23) return 14;
  if (zoom >= 21) return 10;
  if (zoom >= 19) return 7;
  if (zoom >= 17) return 4.5;
  if (zoom >= 15) return 3;
  if (zoom >= 13) return 2;
  return 1.2;
}

/**
 * Agrega el botón "Centrar en mi ubicación" y un punto que se mantiene
 * siguiendo la posición real del usuario (usa watchPosition, no una sola
 * lectura) para que se mueva solo, sin recargar ni volver a pulsar el botón.
 * Devuelve una función para detener el seguimiento al desmontar el mapa.
 */
export function agregarControlUbicacion(map: L.Map) {
  const control = new L.Control({ position: "topleft" });
  let ultimaUbicacion: L.LatLng | null = null;
  let centrarEnProximaUbicacion = true;

  // Botón 📍 del control.
  control.onAdd = () => {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    const btn = L.DomUtil.create("a", "", div) as HTMLAnchorElement;
    btn.innerHTML = "📍";
    btn.href = "#";
    btn.title = "Centrar en mi ubicación";
    btn.style.fontSize = "16px";
    btn.style.lineHeight = "30px";
    btn.style.textAlign = "center";
    btn.style.textDecoration = "none";
    btn.style.cursor = "pointer";

    // Al pulsarlo: centra en la última ubicación conocida, o en la próxima que llegue.
    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      if (ultimaUbicacion) {
        map.setView(ultimaUbicacion, Math.max(map.getZoom(), 16));
      } else {
        centrarEnProximaUbicacion = true;
      }
    });

    return div;
  };

  control.addTo(map);

  // Punto azul que marca la posición del usuario.
  let userMarker: L.CircleMarker | null = null;

  // Cada vez que llega una ubicación: se mueve (o se crea) el punto y, si corresponde, se centra el mapa.
  map.on("locationfound", (e: L.LocationEvent) => {
    ultimaUbicacion = e.latlng;
    const textoPopup = `Estás a aprox. ${Math.round(e.accuracy / 2)} metros de este punto`;

    if (userMarker) {
      userMarker.setLatLng(e.latlng);
      userMarker.setPopupContent(textoPopup);
    } else {
      userMarker = L.circleMarker(e.latlng, {
        radius: 6,
        color: "#1d4ed8",
        fillColor: "#60a5fa",
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup(textoPopup);
    }

    if (centrarEnProximaUbicacion) {
      centrarEnProximaUbicacion = false;
      map.setView(e.latlng, 16);
    }
  });

  // Inicia el seguimiento continuo de la ubicación.
  map.locate({ watch: true, enableHighAccuracy: true, maximumAge: 5000 });

  return () => map.stopLocate();
}

/**
 * Crea un control vacío de Leaflet que sirve de "anfitrión" para un botón/menú
 * de React (vía createPortal). Se bloquea la propagación de clics/scroll para
 * que no lleguen al mapa.
 */
function crearControlAnfitrion(map: L.Map, zIndex?: number): HTMLDivElement {
  const control = new L.Control({ position: "topleft" });
  let container!: HTMLDivElement;

  control.onAdd = () => {
    container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.style.position = "relative";
    if (zIndex !== undefined) container.style.zIndex = String(zIndex);
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    return container;
  };

  control.addTo(map);
  return container;
}

/** Control (topleft, debajo del botón de ubicación) que aloja el menú de herramientas. */
export function agregarControlHerramientas(map: L.Map): HTMLDivElement {
  // Los controles de Leaflet comparten z-index (800), así que los que van
  // después en la esquina se dibujan encima. Este se sube un nivel para que su
  // panel desplegable tape al botón de leyenda que queda debajo, y no al revés.
  return crearControlAnfitrion(map, 801);
}

/** Control (topleft, debajo del de herramientas) que aloja el botón de leyenda. */
export function agregarControlLeyenda(map: L.Map): HTMLDivElement {
  return crearControlAnfitrion(map);
}
