import L from "leaflet";

export type PreferenciasEtiquetas = {
  /** Si se muestran los nombres de las colonias sobre el mapa. */
  visibles: boolean;
  /** Tamaño del texto en píxeles. */
  tamano: number;
};

export const TAMANO_ETIQUETA_MIN = 8;
export const TAMANO_ETIQUETA_MAX = 24;
export const PREFERENCIAS_ETIQUETAS_POR_DEFECTO: PreferenciasEtiquetas = {
  visibles: true,
  tamano: 10,
};

const CLAVE_STORAGE = "mapa_etiquetas_colonias";
/** Debe coincidir con el `className` de los tooltips de la capa (extraLayers.ts) y con leaflet-overrides.css. */
const CLASE_ETIQUETA = "colonia-label";
const CLASE_OCULTAR = "sin-etiquetas-colonias";
const VARIABLE_TAMANO = "--colonia-label-size";

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
