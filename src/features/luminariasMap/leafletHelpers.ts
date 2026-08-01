import L from "leaflet";

export function crearCapasBase() {
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 24,
    maxNativeZoom: 19,
    attribution: "&copy; OpenStreetMap",
  });

  const satelital = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 24,
      maxNativeZoom: 19,
      attribution: "Tiles © Esri",
    }
  );

  return { osm, satelital };
}

export function obtenerRadioZoom(zoom: number) {
  if (zoom >= 23) return 14;
  if (zoom >= 21) return 10;
  if (zoom >= 19) return 7;
  if (zoom >= 17) return 4.5;
  if (zoom >= 15) return 3;
  if (zoom >= 13) return 2;
  return 1.2;
}

export function agregarControlUbicacion(map: L.Map) {
  const control = new L.Control({ position: "topleft" });

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

    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 16 });
    });

    return div;
  };

  control.addTo(map);

  let userMarker: L.CircleMarker | null = null;

  map.on("locationfound", (e: L.LocationEvent) => {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
      radius: 6,
      color: "#1d4ed8",
      fillColor: "#60a5fa",
      fillOpacity: 0.9,
    })
      .addTo(map)
      .bindPopup(`Estás a aprox. ${Math.round(e.accuracy / 2)} metros de este punto`);
  });

  map.locate({ setView: true, maxZoom: 16 });
}
