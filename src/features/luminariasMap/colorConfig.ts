// Configuración del mapa de luminarias: tipos, colores, categorías, campos editables y capas de cada modo.
import { supabase } from "../../lib/supabaseClient";
import { encolarMutacion, esErrorDeRed } from "../../lib/offlineQueue";
import type { Luminaria } from "../../lib/types";

/** Los dos modos del mapa. */
export type MapMode = "censo" | "reporte";

/** Una categoría para contar y colorear luminarias (p. ej. "LED" o "Dañadas"). */
export type StatCategoria = {
  key: string;
  label: string;
  color: string;
  matches: (valor: string | null) => boolean;
};

/** Un dato de solo lectura que se muestra en el popup. */
export type CampoPopup = { label: string; value: string };

/** Configuración de una capa adicional del mapa (colonias, parcelario, calles). */
export type CapaExtraConfig = {
  id: string;
  label: string;
  /** URL de donde descargar el GeoJSON. Ignorado si se define `cargarDatos`. */
  url?: string;
  /** Si se define, reemplaza `fetch(url)` para obtener los datos (ej. una tabla de Supabase en vez de un archivo estático). */
  cargarDatos?: () => Promise<GeoJSON.FeatureCollection>;
  color: string;
  weight: number;
  fillOpacity: number;
  /** Si se define, el color de cada feature se calcula a partir de sus propiedades (en vez de usar `color` fijo para todos). */
  colorPorPropiedad?: (props: GeoJSON.GeoJsonProperties) => string;
  /** Ítems a mostrar en la leyenda para esta capa. Si no se define, se usa un solo ítem con `label`/`color`. */
  leyenda?: { label: string; color: string }[];
  /** Si se define junto con `leyenda`, clasifica cada feature en el `label` de leyenda que le corresponde, para poder mostrar cuántos hay de cada uno. */
  leyendaPorPropiedad?: (props: GeoJSON.GeoJsonProperties) => string;
  /** Forma del símbolo en la leyenda: "linea" para capas de líneas/bordes (por defecto "punto"). */
  simboloLeyenda?: "punto" | "linea";
  /** Nombre de la propiedad a mostrar como etiqueta permanente sobre cada feature (como los distritos). */
  tooltipField?: string;
  /** Campos a mostrar en el popup al hacer click sobre un feature. */
  popupFields?: { label: string; propKey: string }[];
  /** Campos que se pueden editar desde el popup (aparecen como <select> en vez de texto). Requiere `guardarEdicion`. */
  camposEditables?: { propKey: string; label: string; opciones: string[] }[];
  /** Guarda los cambios hechos desde `camposEditables` (recibe las propiedades originales del feature y los valores nuevos). */
  guardarEdicion?: (
    props: GeoJSON.GeoJsonProperties,
    cambios: Record<string, string>
  ) => Promise<void>;
  /** Si es true, el archivo no se descarga hasta que el usuario active la capa (para archivos pesados). */
  lazy: boolean;
  /** Si es true, la capa se muestra (y descarga, si es lazy) automáticamente al abrir el mapa. */
  visiblePorDefecto?: boolean;
  /**
   * Si es false, la capa no captura clicks (solo se ve el borde/etiqueta).
   * Necesario para capas sin popup que se solapan con otras capas clicleables
   * (ej. Colonias sobre Parcelario) — de lo contrario su relleno invisible
   * intercepta el click antes de que llegue a la capa de abajo.
   * Por defecto true.
   */
  interactive?: boolean;
};

/** Todo lo que cambia entre el modo censo y el modo reporte. */
export type MapaConfig = {
  mode: MapMode;
  titulo: string;
  selectColumns: string;
  colorFor: (row: Luminaria) => string;
  statsCategories: StatCategoria[];
  editableField: "tipo" | "estado";
  editableLabel: string;
  editableOpciones: string[];
  /** Si es true, el popup muestra una casilla para marcar/desmarcar "Tasada" directamente. */
  editableTasada?: boolean;
  /** Si es true, el popup muestra un selector para marcar el servicio como nuevo o antiguo directamente. */
  editableServicio?: boolean;
  popupTitulo: (row: Luminaria) => string;
  popupCampos: (row: Luminaria) => CampoPopup[];
  addForm: {
    fieldKey: "tipo" | "estado";
    fieldLabel: string;
    opciones: { value: string; label: string }[];
  };
  capasExtra: CapaExtraConfig[];
};

/** Texto a mostrar para el campo servicio. */
function etiquetaServicio(servicio: Luminaria["servicio"]) {
  if (servicio === "nuevo") return "Nuevo";
  if (servicio === "antiguo") return "Antiguo";
  return "Sin clasificar";
}

/** Normaliza un texto para compararlo: minúsculas y sin espacios sobrantes. */
function norm(v: string | null | undefined) {
  return (v || "").toString().toLowerCase().trim();
}

/** Limpia el valor de MATERIAL (espacios extra, backticks sueltos, etc. que trae el dato original). */
function normalizarMaterial(valor: unknown) {
  return (valor ?? "")
    .toString()
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .trim();
}

/** Categorías de material de calle: única fuente de verdad para color, leyenda y conteo. */
const MATERIALES_CALLE = [
  { label: "Asfalto", color: "#000000", test: (m: string) => m.startsWith("ASFALTO") },
  { label: "Tierra", color: "#78350f", test: (m: string) => m.startsWith("TIERRA") },
  {
    label: "Pavimento (concreto)",
    color: "#2563eb",
    test: (m: string) => m.startsWith("CONCRETO") || m === "CONARETO",
  },
];
const OTRO_MATERIAL_CALLE = { label: "Otro material", color: "#94a3b8" };

/** Categoría de material que corresponde a una calle. */
function categoriaMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  const material = normalizarMaterial(props?.material_norm);
  return MATERIALES_CALLE.find((m) => m.test(material)) ?? OTRO_MATERIAL_CALLE;
}

/** Color de una calle según su material. */
function colorPorMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  return categoriaMaterialCalle(props).color;
}

/** Etiqueta de leyenda de una calle según su material. */
function leyendaPorMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  return categoriaMaterialCalle(props).label;
}

/** La capa de Calles lee y edita directamente la tabla `vias_san_marcos` (con geometría PostGIS) en vez de un archivo estático. */
async function cargarViasSanMarcos(): Promise<GeoJSON.FeatureCollection> {
  // { get: true } hace la llamada por GET en vez de POST, para que el
  // service worker pueda cachearla igual que el resto de lecturas a Supabase.
  const { data, error } = await supabase.rpc("vias_san_marcos_geojson", {}, { get: true });
  if (error) throw error;
  return data as GeoJSON.FeatureCollection;
}

/** Guarda el material y el estado editados de una calle; sin conexión, el cambio se encola. */
async function guardarEdicionVia(props: GeoJSON.GeoJsonProperties, cambios: Record<string, string>) {
  const id = props?.id;
  if (id == null) throw new Error("No se encontró el id de la calle.");

  const patch = { material_norm: cambios.material_norm, estado_norm: cambios.estado_norm };

  // Sin conexión: se guarda en la cola para enviarlo después.
  if (!navigator.onLine) {
    encolarMutacion({ tipo: "viaUpdate", viaId: id, patch });
    return;
  }

  // Con conexión: se guarda directo; si falla la red, se encola.
  try {
    const { error } = await supabase.from("vias_san_marcos").update(patch).eq("id", id);
    if (error) throw error;
  } catch (err) {
    if (!esErrorDeRed(err)) throw err;
    encolarMutacion({ tipo: "viaUpdate", viaId: id, patch });
  }
}

/** Modo censo: se clasifica y edita el tipo de luminaria. */
const censoConfig: MapaConfig = {
  mode: "censo",
  titulo: "Censo de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia, distrito, tasada, servicio",
  // Color del punto según el tipo.
  colorFor: (row) => {
    const t = norm(row.tipo);
    if (t === "led") return "#22c55e";
    if (t === "mercurio") return "#3b82f6";
    if (t === "fluorescente" || t === "fluoresente") return "#a855f7";
    if (t === "sodio") return "#f59e0b";
    return "#6b7280";
  },
  // Categorías para la leyenda y el dashboard.
  statsCategories: [
    { key: "led", label: "LED", color: "#22c55e", matches: (v) => norm(v) === "led" },
    { key: "mercurio", label: "Mercurio", color: "#3b82f6", matches: (v) => norm(v) === "mercurio" },
    {
      key: "fluorescente",
      label: "Fluorescente",
      color: "#a855f7",
      matches: (v) => norm(v) === "fluorescente" || norm(v) === "fluoresente",
    },
    { key: "sodio", label: "Sodio", color: "#f59e0b", matches: (v) => norm(v) === "sodio" },
    {
      key: "otro",
      label: "Otro / N/D",
      color: "#6b7280",
      matches: (v) => !["led", "mercurio", "fluorescente", "fluoresente", "sodio"].includes(norm(v)),
    },
  ],
  // Campo que se edita desde el popup y sus opciones.
  editableField: "tipo",
  editableLabel: "tipo",
  editableOpciones: ["led", "mercurio", "fluorescente", "sodio"],
  editableTasada: true,
  editableServicio: true,
  // Contenido del popup.
  popupTitulo: (row) => `ID: ${row.id}`,
  popupCampos: (row) => [
    { label: "Tipo", value: row.tipo || "N/D" },
  ],
  // Formulario de alta de una luminaria.
  addForm: {
    fieldKey: "tipo",
    fieldLabel: "Tipo",
    opciones: [
      { value: "led", label: "LED" },
      { value: "mercurio", label: "Mercurio" },
      { value: "fluorescente", label: "Fluorescente" },
      { value: "sodio", label: "Sodio" },
    ],
  },
  // Capas adicionales disponibles en el control de capas.
  capasExtra: [
    // Colonias: solo contorno y nombre, no captura clics.
    {
      id: "colonias",
      label: "Colonias",
      url: "/colonias-san-marcos.geojson",
      color: "#a855f7",
      weight: 1.5,
      fillOpacity: 0,
      tooltipField: "text_1",
      leyendaPorPropiedad: () => "Colonias",
      lazy: false,
      interactive: false,
    },
    // Parcelario: archivo pesado, se descarga al activar la capa.
    {
      id: "parcelario",
      label: "Parcelario",
      url: "/parcelario-san-marcos.geojson",
      color: "#f97316",
      weight: 0.6,
      fillOpacity: 0.05,
      leyendaPorPropiedad: () => "Parcelario",
      popupFields: [
        { label: "Sector", propKey: "SECTOR" },
        { label: "Parcela", propKey: "PARCELA" },
        { label: "Clave", propKey: "CLAVE_1" },
        { label: "Dirección", propKey: "DIRECCION" },
        { label: "Propietario", propKey: "PROPIETARI" },
        { label: "Área (m²)", propKey: "AREA_CALCU" },
        { label: "Frente (m)", propKey: "FRENTE_MT_" },
      ],
      lazy: true,
    },
    // Calles: se leen de Supabase, se colorean por material y se pueden editar.
    {
      id: "calles",
      label: "Calles",
      cargarDatos: cargarViasSanMarcos,
      color: "#94a3b8",
      colorPorPropiedad: colorPorMaterialCalle,
      leyenda: [...MATERIALES_CALLE, OTRO_MATERIAL_CALLE],
      leyendaPorPropiedad: leyendaPorMaterialCalle,
      simboloLeyenda: "linea",
      weight: 3,
      fillOpacity: 0,
      popupFields: [
        { label: "Calle", propKey: "nombre_de" },
        { label: "Colonia", propKey: "text_1" },
        { label: "Material (original)", propKey: "material" },
        { label: "Estado (original)", propKey: "estado" },
        { label: "Vías", propKey: "vias" },
        { label: "Clase", propKey: "clase" },
        { label: "Ancho (m)", propKey: "ancho_1" },
      ],
      camposEditables: [
        {
          propKey: "material_norm",
          label: "Material",
          opciones: [
            "ASFALTO",
            "CONCRETO",
            "TIERRA",
            "ADOQUIN",
            "EMPEDRADO",
            "LADRILLO DE PISO",
            "PIEDRA",
            "OTRO",
          ],
        },
        { propKey: "estado_norm", label: "Estado", opciones: ["BUENO", "REGULAR", "MALO"] },
      ],
      guardarEdicion: guardarEdicionVia,
      lazy: true,
    },
  ],
};

/** Modo reporte: se clasifica y edita el estado de la luminaria. */
const reporteConfig: MapaConfig = {
  mode: "reporte",
  titulo: "Reporte de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia, estado, distrito, tasada, servicio",
  // Color del punto según el estado.
  colorFor: (row) => {
    const v = norm(row.estado);
    if (v === "buena") return "#22c55e";
    if (v === "danada" || v === "dañada") return "#ef4444";
    if (v === "mantenimiento") return "#eab308";
    return "#6b7280";
  },
  // Categorías para la leyenda y el dashboard.
  statsCategories: [
    { key: "buenas", label: "Buenas", color: "#22c55e", matches: (v) => norm(v) === "buena" },
    {
      key: "danadas",
      label: "Dañadas",
      color: "#ef4444",
      matches: (v) => norm(v) === "danada" || norm(v) === "dañada",
    },
    {
      key: "proceso",
      label: "En proceso",
      color: "#eab308",
      matches: (v) => norm(v) === "mantenimiento",
    },
    {
      key: "otro",
      label: "Otro / N/D",
      color: "#6b7280",
      matches: (v) => !["buena", "danada", "dañada", "mantenimiento"].includes(norm(v)),
    },
  ],
  // Campo que se edita desde el popup y sus opciones.
  editableField: "estado",
  editableLabel: "estado",
  editableOpciones: ["buena", "dañada", "mantenimiento"],
  // Contenido del popup.
  popupTitulo: (row) => `Luminaria ${row.id}`,
  popupCampos: (row) => [
    { label: "Estado", value: row.estado || "N/D" },
    { label: "Distrito", value: row.distrito || "N/D" },
    { label: "Tipo", value: row.tipo || "N/D" },
    { label: "Tasada", value: row.tasada ? "Sí" : "No" },
    { label: "Servicio", value: etiquetaServicio(row.servicio) },
    { label: "Lat", value: String(row.lat) },
    { label: "Lng", value: String(row.lng) },
  ],
  // Formulario de alta de una luminaria.
  addForm: {
    fieldKey: "estado",
    fieldLabel: "Estado",
    opciones: [
      { value: "buena", label: "Buena" },
      { value: "dañada", label: "Dañada" },
      { value: "mantenimiento", label: "En Mantenimiento" },
    ],
  },
  // El reporte muestra las capas del censo menos el parcelario (solo colonias y calles).
  capasExtra: censoConfig.capasExtra.filter((capa) => capa.id !== "parcelario"),
};

/** Devuelve la configuración del modo indicado. */
export function getMapConfig(mode: MapMode): MapaConfig {
  return mode === "censo" ? censoConfig : reporteConfig;
}
