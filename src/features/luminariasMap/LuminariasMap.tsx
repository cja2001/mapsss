import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-overrides.css";
import { getMapConfig, type MapMode } from "./colorConfig";
import { useLuminarias } from "./useLuminarias";
import { ReporteDashboard } from "./ReporteDashboard";
import { DashboardPanel } from "./DashboardPanel";
import { LeyendaPanel } from "./LeyendaPanel";
import { MapToolsMenu } from "./MapToolsMenu";
import {
  aplicarPreferenciasEtiquetas,
  guardarPreferenciasEtiquetas,
  leerPreferenciasEtiquetas,
} from "./etiquetasColonias";
import { MapLegendButton } from "./MapLegendButton";
import { MapTopBar, type MapVista } from "./MapTopBar";
import { cargarDistritos } from "./districtsLayer";
import { agregarCapaExtra } from "./extraLayers";
import { useColoniasBuscador, type ColoniaSugerencia } from "./useColoniasBuscador";
import {
  crearCapasBase,
  obtenerRadioZoom,
  agregarControlUbicacion,
  agregarControlHerramientas,
  agregarControlLeyenda,
} from "./leafletHelpers";
import { crearMedidor, type Medidor } from "./measureTool";
import { buildPopupContent, buildAddFormContent } from "./popupContent";
import { cargarHistorialTipo } from "./historialTipo";
import type { Luminaria } from "../../lib/types";

const CENTRO_INICIAL: [number, number] = [13.692, -89.191];

export function LuminariasMap({ mode }: { mode: MapMode }) {
  const config = getMapConfig(mode);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const medidorRef = useRef<Medidor | null>(null);
  const resaltadoBusquedaRef = useRef<L.GeoJSON | null>(null);
  const [addActivo, setAddActivo] = useState(false);
  const [medirActivo, setMedirActivo] = useState(false);
  const [medicionTexto, setMedicionTexto] = useState<string | null>(null);
  const [vista, setVista] = useState<MapVista>("mapa");
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [leyendaActiva, setLeyendaActiva] = useState(false);
  const [toolsContainer, setToolsContainer] = useState<HTMLDivElement | null>(null);
  const [leyendaContainer, setLeyendaContainer] = useState<HTMLDivElement | null>(null);
  const [etiquetas, setEtiquetas] = useState(leerPreferenciasEtiquetas);

  const { buscarSugerencias } = useColoniasBuscador();
  const sugerenciasBusqueda = buscarSugerencias(queryBusqueda);

  function seleccionarColonia(colonia: ColoniaSugerencia) {
    const map = mapRef.current;
    if (!map) return;

    resaltadoBusquedaRef.current?.remove();
    const resaltado = L.geoJSON(colonia.feature, {
      style: { color: "#2563eb", weight: 3, fillColor: "#2563eb", fillOpacity: 0.25 },
    }).addTo(map);
    resaltadoBusquedaRef.current = resaltado;

    map.fitBounds(colonia.bounds, { maxZoom: 17, padding: [40, 40] });
    setQueryBusqueda("");

    window.setTimeout(() => {
      if (resaltadoBusquedaRef.current === resaltado) {
        resaltado.remove();
        resaltadoBusquedaRef.current = null;
      }
    }, 4000);
  }

  const { data, loading, error, pendientes, updateLuminaria, insertLuminaria } = useLuminarias(
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
    config.capasExtra.forEach((capa) => agregarCapaExtra(map, controlCapas, capa, isCancelado));
    const detenerUbicacion = agregarControlUbicacion(map);
    setToolsContainer(agregarControlHerramientas(map));
    setLeyendaContainer(agregarControlLeyenda(map));

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    controlCapas.addOverlay(layerGroup, "Luminarias");

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
      detenerUbicacion();
      medidorRef.current?.destruir();
      medidorRef.current = null;
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      resaltadoBusquedaRef.current = null;
      setToolsContainer(null);
      setLeyendaContainer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Aplica (y recuerda) el tamaño y la visibilidad de las etiquetas de colonias
  useEffect(() => {
    guardarPreferenciasEtiquetas(etiquetas);
    if (mapRef.current) aplicarPreferenciasEtiquetas(mapRef.current, etiquetas);
  }, [etiquetas, mode]);

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
        buildPopupContent(row, config, {
          onGuardarEdicion: async (nuevoValor) => {
            try {
              await updateLuminaria(row.id, {
                [config.editableField]: nuevoValor,
              } as Partial<Luminaria>);
              map.closePopup();
            } catch (err) {
              alert("Error al actualizar: " + (err instanceof Error ? err.message : err));
            }
          },
          onGuardarTasada: async (nuevoValor) => {
            try {
              await updateLuminaria(row.id, { tasada: nuevoValor });
            } catch (err) {
              alert("Error al actualizar: " + (err instanceof Error ? err.message : err));
            }
          },
          onGuardarServicio: async (nuevoValor) => {
            try {
              await updateLuminaria(row.id, { servicio: nuevoValor });
            } catch (err) {
              alert("Error al actualizar: " + (err instanceof Error ? err.message : err));
            }
          },
          cargarHistorial: () => cargarHistorialTipo(row.id),
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

      const contenido = buildAddFormContent(config, async ({ campo, potencia, servicio }) => {
        try {
          await insertLuminaria({
            lat,
            lng,
            potencia,
            servicio,
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

  // Censo y reporte comparten la misma barra superior, herramientas y capas;
  // solo cambia el contenido del dashboard.
  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainerRef} className="leaflet-with-topbar h-full w-full" />

      <MapTopBar
        vista={vista}
        onVistaChange={setVista}
        query={queryBusqueda}
        onQueryChange={setQueryBusqueda}
        sugerencias={sugerenciasBusqueda}
        onSeleccionarColonia={seleccionarColonia}
      />

      {vista === "dashboard" &&
        (mode === "reporte" ? (
          <ReporteDashboard
            data={data}
            config={config}
            loading={loading}
            error={error}
            pendientes={pendientes}
          />
        ) : (
          <DashboardPanel data={data} config={config} />
        ))}

      {leyendaActiva && (
        <LeyendaPanel data={data} config={config} onCerrar={() => setLeyendaActiva(false)} />
      )}

      {toolsContainer &&
        createPortal(
          <MapToolsMenu
            onAdd={alternarAgregar}
            addActivo={addActivo}
            medirActivo={medirActivo}
            medicionTexto={medicionTexto}
            onToggleMedir={alternarMedir}
            onBorrarMedicion={borrarMedicion}
            etiquetas={etiquetas}
            onEtiquetasChange={setEtiquetas}
          />,
          toolsContainer
        )}

      {leyendaContainer &&
        createPortal(
          <MapLegendButton activo={leyendaActiva} onToggle={() => setLeyendaActiva((v) => !v)} />,
          leyendaContainer
        )}
    </div>
  );
}
