import type { Luminaria } from "../../lib/types";

export type MapMode = "censo" | "reporte";

export type StatCategoria = {
  key: string;
  label: string;
  color: string;
  matches: (valor: string | null) => boolean;
};

export type CampoPopup = { label: string; value: string };

export type CapaExtraConfig = {
  id: string;
  label: string;
  url: string;
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
  popupTitulo: (row: Luminaria) => string;
  popupCampos: (row: Luminaria) => CampoPopup[];
  addForm: {
    fieldKey: "tipo" | "estado";
    fieldLabel: string;
    opciones: { value: string; label: string }[];
  };
  capasExtra: CapaExtraConfig[];
};

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

function categoriaMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  const material = normalizarMaterial(props?.MATERIAL);
  return MATERIALES_CALLE.find((m) => m.test(material)) ?? OTRO_MATERIAL_CALLE;
}

function colorPorMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  return categoriaMaterialCalle(props).color;
}

function leyendaPorMaterialCalle(props: GeoJSON.GeoJsonProperties) {
  return categoriaMaterialCalle(props).label;
}

const censoConfig: MapaConfig = {
  mode: "censo",
  titulo: "Censo de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia, tasada",
  colorFor: (row) => {
    const t = norm(row.tipo);
    if (t === "led") return "#22c55e";
    if (t === "mercurio") return "#3b82f6";
    if (t === "fluorescente" || t === "fluoresente") return "#a855f7";
    if (t === "sodio") return "#f59e0b";
    return "#6b7280";
  },
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
  editableField: "tipo",
  editableLabel: "tipo",
  editableOpciones: ["led", "mercurio", "fluorescente", "sodio"],
  editableTasada: true,
  popupTitulo: (row) => `ID: ${row.id}`,
  popupCampos: (row) => [
    { label: "Tipo", value: row.tipo || "N/D" },
    { label: "Potencia", value: row.potencia || "N/D" },
  ],
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
  capasExtra: [
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
      visiblePorDefecto: true,
    },
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
      visiblePorDefecto: true,
    },
    {
      id: "calles",
      label: "Calles",
      url: "/calles-san-marcos.geojson",
      color: "#94a3b8",
      colorPorPropiedad: colorPorMaterialCalle,
      leyenda: [...MATERIALES_CALLE, OTRO_MATERIAL_CALLE],
      leyendaPorPropiedad: leyendaPorMaterialCalle,
      simboloLeyenda: "linea",
      weight: 2,
      fillOpacity: 0,
      popupFields: [
        { label: "Calle", propKey: "NOMBRE_DE" },
        { label: "Colonia", propKey: "Text_1" },
        { label: "Estado", propKey: "ESTADO" },
        { label: "Material", propKey: "MATERIAL" },
        { label: "Vías", propKey: "VIAS" },
        { label: "Clase", propKey: "CLASE" },
        { label: "Ancho (m)", propKey: "ANCHO_1" },
      ],
      lazy: true,
    },
  ],
};

const reporteConfig: MapaConfig = {
  mode: "reporte",
  titulo: "Reporte de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia, estado, distrito, tasada",
  colorFor: (row) => {
    const v = norm(row.estado);
    if (v === "buena") return "#22c55e";
    if (v === "danada" || v === "dañada") return "#ef4444";
    if (v === "mantenimiento") return "#eab308";
    return "#6b7280";
  },
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
  editableField: "estado",
  editableLabel: "estado",
  editableOpciones: ["buena", "dañada", "mantenimiento"],
  popupTitulo: (row) => `Luminaria ${row.id}`,
  popupCampos: (row) => [
    { label: "Potencia", value: row.potencia || "N/D" },
    { label: "Estado", value: row.estado || "N/D" },
    { label: "Distrito", value: row.distrito || "N/D" },
    { label: "Tipo", value: row.tipo || "N/D" },
    { label: "Tasada", value: row.tasada ? "Sí" : "No" },
    { label: "Lat", value: String(row.lat) },
    { label: "Lng", value: String(row.lng) },
  ],
  addForm: {
    fieldKey: "estado",
    fieldLabel: "Estado",
    opciones: [
      { value: "buena", label: "Buena" },
      { value: "dañada", label: "Dañada" },
      { value: "mantenimiento", label: "En Mantenimiento" },
    ],
  },
  capasExtra: [],
};

export function getMapConfig(mode: MapMode): MapaConfig {
  return mode === "censo" ? censoConfig : reporteConfig;
}
