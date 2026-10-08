// Preferencias del usuario sobre las etiquetas (nombres) de la capa de colonias.
import L from "leaflet";

/** Preferencias de las etiquetas de colonias. */
export type PreferenciasEtiquetas = {
  /** Si se muestran los nombres de las colonias sobre el mapa. */
  visibles: boolean;
  /** Tamaño del texto en píxeles. */
  tamano: number;
};

// Límites del tamaño del texto y valores iniciales.
export const TAMANO_ETIQUETA_MIN = 8;
export const TAMANO_ETIQUETA_MAX = 24;
export const PREFERENCIAS_ETIQUETAS_POR_DEFECTO: PreferenciasEtiquetas = {
  visibles: true,
  tamano: 10,
};

// Clave de localStorage, clase CSS de las etiquetas, clase que las oculta y variable CSS del tamaño.
const CLAVE_STORAGE = "mapa_etiquetas_colonias";
/** Debe coincidir con el `className` de los tooltips de la capa (extraLayers.ts) y con leaflet-overrides.css. */
const CLASE_ETIQUETA = "colonia-label";
const CLASE_OCULTAR = "sin-etiquetas-colonias";
const VARIABLE_TAMANO = "--colonia-label-size";

/** Lee las preferencias guardadas; si faltan o son inválidas, devuelve las iniciales. */
export function leerPreferenciasEtiquetas(): PreferenciasEtiquetas {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (!raw) return PREFERENCIAS_ETIQUETAS_POR_DEFECTO;
    const guardado = JSON.parse(raw) as Partial<PreferenciasEtiquetas>;
    const tamano = Number(guardado.tamano);
    return {
      visibles: guardado.visibles !== false,
      tamano: Number.isFinite(tamano)
        ? Math.min(TAMANO_ETIQUETA_MAX, Math.max(TAMANO_ETIQUETA_MIN, tamano))
        : PREFERENCIAS_ETIQUETAS_POR_DEFECTO.tamano,
    };
  } catch {
    return PREFERENCIAS_ETIQUETAS_POR_DEFECTO;
  }
}

/** Guarda las preferencias en localStorage. */
export function guardarPreferenciasEtiquetas(preferencias: PreferenciasEtiquetas) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(preferencias));
  } catch {
    // Sin almacenamiento disponible: la preferencia solo dura esta sesión.
  }
}

/**
 * Aplica el tamaño y la visibilidad de las etiquetas de colonias. Se hace con
 * CSS sobre el contenedor del mapa, así también afecta a las etiquetas que se
 * creen después (la capa se puede activar más tarde).
 */
export function aplicarPreferenciasEtiquetas(map: L.Map, preferencias: PreferenciasEtiquetas) {
  const contenedor = map.getContainer();
  contenedor.style.setProperty(VARIABLE_TAMANO, `${preferencias.tamano}px`);
  contenedor.classList.toggle(CLASE_OCULTAR, !preferencias.visibles);

  // Leaflet centra cada etiqueta según el tamaño que tenía al colocarla; al
  // cambiar el tamaño del texto (o volver a mostrarla) hay que recolocarla.
  map.eachLayer((capa) => {
    if (capa instanceof L.Tooltip && capa.options.className === CLASE_ETIQUETA) {
      const posicion = capa.getLatLng();
      if (posicion) capa.setLatLng(posicion);
    }
  });
}
