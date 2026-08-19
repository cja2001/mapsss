export type TipoDispositivo = "movil" | "tablet" | "escritorio";

const UA_TABLET = /ipad|android(?!.*mobile)|tablet/i;
const UA_MOVIL = /iphone|ipod|android.*mobile|mobile.*android|windows phone|blackberry/i;

/**
 * Clasifica el dispositivo actual usando User-Agent Client Hints cuando están
 * disponibles (Chrome/Edge/Android) y, si no, el User-Agent clásico (Safari,
 * Firefox). No hay una API 100% confiable para esto en todos los navegadores.
 */
/**
 * iPadOS 13+ se reporta como "MacIntel" en el User-Agent, igual que un Mac de
 * escritorio, pero con soporte táctil (que un Mac real no tiene).
 */
function esIpadComoMac() {
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export function detectarTipoDispositivo(): TipoDispositivo {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  const ua = navigator.userAgent;

  if (UA_TABLET.test(ua) || esIpadComoMac()) return "tablet";
  if (UA_MOVIL.test(ua)) return "movil";
  if (uaData?.mobile) return "movil";

  return "escritorio";
}

/** iOS/iPadOS no soportan el evento `beforeinstallprompt`; hay que mostrarles
 *  instrucciones manuales ("Compartir → Agregar a pantalla de inicio"). */
export function esIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || esIpadComoMac();
}
