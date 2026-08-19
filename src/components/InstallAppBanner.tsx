import { useState } from "react";
import { detectarTipoDispositivo, esIOS } from "../lib/deviceType";
import { useInstallPrompt } from "../lib/useInstallPrompt";

const CLAVE_DESCARTADO = "instalar_app_descartado";

/**
 * Alerta para instalar la PWA, solo en móvil/tablet (en escritorio no aplica).
 * En Chrome/Edge/Android usa el prompt nativo; en iOS (que no lo soporta) da
 * las instrucciones manuales de "Compartir → Agregar a pantalla de inicio".
 */
export function InstallAppBanner() {
  const [dispositivo] = useState(detectarTipoDispositivo);
  const [descartado, setDescartado] = useState(
    () => localStorage.getItem(CLAVE_DESCARTADO) === "1"
  );
  const { disponible, instalada, instalar } = useInstallPrompt();

  const esMovilOTablet = dispositivo === "movil" || dispositivo === "tablet";
  const instruccionesIOS = esMovilOTablet && !disponible && esIOS();

  if (!esMovilOTablet || instalada || descartado) return null;
  if (!disponible && !instruccionesIOS) return null;

  function descartar() {
    localStorage.setItem(CLAVE_DESCARTADO, "1");
    setDescartado(true);
  }

  async function manejarInstalar() {
    const aceptado = await instalar();
    if (aceptado) descartar();
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[2000] flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl">
      <span className="text-2xl" aria-hidden="true">
        📲
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Instala la app</p>
        <p className="text-xs text-slate-500">
          {instruccionesIOS
            ? "Toca compartir (⬆️) y luego “Agregar a pantalla de inicio”."
            : "Añádela a tu pantalla de inicio para abrirla más rápido, incluso sin señal."}
        </p>
      </div>

      {!instruccionesIOS && (
        <button
          type="button"
          onClick={manejarInstalar}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          Instalar
        </button>
      )}

      <button
        type="button"
        onClick={descartar}
        aria-label="Cerrar"
        className="shrink-0 rounded p-1 text-lg leading-none text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
    </div>
  );
}
