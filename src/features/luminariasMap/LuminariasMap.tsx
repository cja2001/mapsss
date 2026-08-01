import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Link } from "react-router";
import "leaflet/dist/leaflet.css";
import "./leaflet-overrides.css";
import { getMapConfig, type MapMode } from "./colorConfig";
import { useLuminarias } from "./useLuminarias";
import { StatsPanel } from "./StatsPanel";
import { cargarDistritos } from "./districtsLayer";
import { agregarCapaExtra } from "./extraLayers";
import { crearCapasBase, obtenerRadioZoom, agregarControlUbicacion } from "./leafletHelpers";
import { crearMedidor, type Medidor } from "./measureTool";
import { buildPopupContent, buildAddFormContent } from "./popupContent";
import type { Luminaria } from "../../lib/types";

const CENTRO_INICIAL: [number, number] = [13.692, -89.191];

// Rango Unicode de marcas diacríticas combinantes (U+0300–U+036F), construido
// con códigos numéricos para evitar caracteres combinantes literales en el fuente.
const DIACRITICOS_REGEX = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g"
);

function normalizarTexto(v: string) {
  return v.normalize("NFD").replace(DIACRITICOS_REGEX, "").toLowerCase().trim();
}

export function LuminariasMap({ mode }: { mode: MapMode }) {
  const config = getMapConfig(mode);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const medidorRef = useRef<Medidor | null>(null);
  const coloniasLayerRef = useRef<L.GeoJSON | null>(null);
  const [addActivo, setAddActivo] = useState(false);
  const [medirActivo, setMedirActivo] = useState(false);
  const [medicionTexto, setMedicionTexto] = useState<string | null>(null);
  const [busquedaColonia, setBusquedaColonia] = useState("");
  const [errorBusquedaColonia, setErrorBusquedaColonia] = useState<string | null>(null);
  const tieneColonias = config.capasExtra.some((capa) => capa.id === "colonias");

  const { data, loading, error, updateLuminaria, insertLuminaria } = useLuminarias(
    config.selectColumns
  );

  // Inicializa el mapa una sola vez por montaje del componente
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, { preferCanvas: true, maxZoom: 24 }).setView(
      CENTRO_INICIAL,
      10
    );
    mapRef.current = map;

    let cancelado = false;
    const isCancelado = () => cancelado;

    const { osm, satelital } = crearCapasBase();
    satelital.addTo(map);
    const controlCapas = L.control.layers({ "Mapa normal": osm, Satelital: satelital }, {}).addTo(map);

    cargarDistritos(map, satelital, isCancelado).catch((err) =>
      console.error("Error al cargar distritos:", err)
    );
    config.capasExtra.forEach((capa) =>
      agregarCapaExtra(map, controlCapas, capa, isCancelado, (layer) => {
        if (capa.id === "colonias") coloniasLayerRef.current = layer;
      })
    );
    agregarControlUbicacion(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    medidorRef.current = crearMedidor(map, setMedicionTexto);

    map.on("zoomend", () => {
      const radio = obtenerRadioZoom(map.getZoom());
      layerGroup.eachLayer((capa) => {
        const marker = capa as L.CircleMarker;
        if (marker.setRadius) marker.setRadius(radio);
      });
    });

    return () => {
      cancelado = true;
      medidorRef.current?.destruir();
      medidorRef.current = null;
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      coloniasLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Dibuja los marcadores cada vez que cambian los datos
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const radio = obtenerRadioZoom(map.getZoom());

    data.forEach((row) => {
      if (row.lat == null || row.lng == null) return;

      const color = config.colorFor(row);
      const marker = L.circleMarker([row.lat, row.lng], {
        radius: radio,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 1,
      });

      marker.bindPopup(
        buildPopupContent(row, config, async (nuevoValor) => {
          try {
            await updateLuminaria(row.id, {
              [config.editableField]: nuevoValor,
            } as Partial<Luminaria>);
            map.closePopup();
          } catch (err) {
            alert("Error al actualizar: " + (err instanceof Error ? err.message : err));
          }
        })
      );

      layerGroup.addLayer(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode]);

  // Flujo de "añadir luminaria": activa modo crosshair y espera un click en el mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !addActivo) return;

    const contenedor = mapContainerRef.current;
    if (contenedor) contenedor.style.cursor = "crosshair";

    function onMapClick(e: L.LeafletMouseEvent) {
      setAddActivo(false);
      const { lat, lng } = e.latlng;

      const contenido = buildAddFormContent(config, async ({ campo, potencia }) => {
        try {
          await insertLuminaria({
            lat,
            lng,
            potencia,
            [config.addForm.fieldKey]: campo.toLowerCase().trim(),
          } as Partial<Luminaria>);
          map!.closePopup();
        } catch (err) {
          alert("Error al añadir: " + (err instanceof Error ? err.message : err));
        }
      });

      L.popup().setLatLng([lat, lng]).setContent(contenido).openOn(map!);
    }

    map.once("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      if (contenedor) contenedor.style.cursor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addActivo, config, insertLuminaria]);

  function alternarAgregar() {
    if (!addActivo && medirActivo) {
      medidorRef.current?.detener();
      setMedirActivo(false);
    }
    setAddActivo((v) => !v);
  }

  function alternarMedir() {
    const medidor = medidorRef.current;
    if (!medidor) return;

    if (medirActivo) {
      medidor.detener();
      setMedirActivo(false);
      return;
    }

    if (addActivo) setAddActivo(false);
    medidor.activar();
    setMedirActivo(true);
  }

  function borrarMedicion() {
    medidorRef.current?.limpiar();
    setMedirActivo(false);
  }

  function buscarColonia() {
    const capaColonias = coloniasLayerRef.current;
    const map = mapRef.current;
    const query = normalizarTexto(busquedaColonia);
    if (!capaColonias || !map || !query) return;

    const coincidencias: L.Polygon[] = [];
    capaColonias.eachLayer((capa) => {
      const feature = (capa as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const nombre = feature?.properties?.text_1;
      if (typeof nombre === "string" && normalizarTexto(nombre).includes(query)) {
        coincidencias.push(capa as L.Polygon);
      }
    });
    const encontrada = coincidencias[0];

    if (!encontrada) {
      setErrorBusquedaColonia("No se encontró ninguna colonia con ese nombre.");
      return;
    }

    setErrorBusquedaColonia(null);
    map.fitBounds(encontrada.getBounds(), { maxZoom: 17, padding: [40, 40] });

    const estiloOriginal = { ...encontrada.options };
    encontrada.setStyle({ color: "#facc15", weight: 4, fillOpacity: 0.35, fillColor: "#facc15" });
    encontrada.bringToFront();
    setTimeout(() => encontrada?.setStyle(estiloOriginal), 2500);
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {tieneColonias && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            buscarColonia();
          }}
          className="absolute left-1/2 top-3 z-[1000] w-72 max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
        >
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <input
              type="text"
              value={busquedaColonia}
              onChange={(e) => {
                setBusquedaColonia(e.target.value);
                if (errorBusquedaColonia) setErrorBusquedaColonia(null);
              }}
              placeholder="Buscar colonia..."
              className="w-full px-3 py-2 text-sm text-slate-700 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              aria-label="Buscar colonia"
            >
              🔍
            </button>
          </div>
          {errorBusquedaColonia && (
            <p className="mt-1 rounded-lg bg-white px-3 py-1 text-xs font-medium text-red-600 shadow">
              {errorBusquedaColonia}
            </p>
          )}
        </form>
      )}

      <Link
        to="/menu"
        className="absolute right-3 top-3 z-[1000] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg hover:bg-slate-50"
      >
        ← Menú
      </Link>

      <StatsPanel
        data={data}
        loading={loading}
        error={error}
        titulo={config.titulo}
        categories={config.statsCategories}
        campo={config.editableField}
        onAdd={alternarAgregar}
        addActivo={addActivo}
        medirActivo={medirActivo}
        medicionTexto={medicionTexto}
        onToggleMedir={alternarMedir}
        onBorrarMedicion={borrarMedicion}
      />
    </div>
  );
}
