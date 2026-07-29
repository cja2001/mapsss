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
  /** Nombre de la propiedad a mostrar como etiqueta permanente sobre cada feature (como los distritos). */
  tooltipField?: string;
  /** Campos a mostrar en el popup al hacer click sobre un feature. */
  popupFields?: { label: string; propKey: string }[];
  /** Si es true, el archivo no se descarga hasta que el usuario active la capa (para archivos pesados). */
  lazy: boolean;
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

const censoConfig: MapaConfig = {
  mode: "censo",
  titulo: "Censo de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia",
  colorFor: (row) => {
    const t = norm(row.tipo);
    if (t === "led") return "#22c55e";
    if (t === "mercurio") return "#3b82f6";
    if (t === "fluorescente" || t === "fluoresente") return "#a855f7";
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
    {
      key: "otro",
      label: "Otro / N/D",
      color: "#6b7280",
      matches: (v) => !["led", "mercurio", "fluorescente", "fluoresente"].includes(norm(v)),
    },
  ],
  editableField: "tipo",
  editableLabel: "tipo",
  editableOpciones: ["led", "mercurio", "fluorescente"],
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
      lazy: false,
      interactive: false,
    },
    {
      id: "parcelario",
      label: "Parcelario",
      url: "/parcelario-san-marcos.geojson",
      color: "#f97316",
      weight: 0.6,
      fillOpacity: 0.05,
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
  ],
};

const reporteConfig: MapaConfig = {
  mode: "reporte",
  titulo: "Reporte de luminarias",
  selectColumns: "id, lat, lng, tipo, potencia, estado, distrito",
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
