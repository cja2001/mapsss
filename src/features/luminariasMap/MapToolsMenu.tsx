import { useEffect, useRef, useState } from "react";
import {
  TAMANO_ETIQUETA_MAX,
  TAMANO_ETIQUETA_MIN,
  type PreferenciasEtiquetas,
} from "./etiquetasColonias";

/**
 * Botón "engrane" que se agrega como control de Leaflet (topleft, debajo del
 * botón de ubicación) y que al abrirse muestra las acciones del mapa: añadir
 * luminaria y medir distancia.
 */
export function MapToolsMenu({
  onAdd,
  addActivo,
  medirActivo,
  medicionTexto,
  onToggleMedir,
  onBorrarMedicion,
  etiquetas,
  onEtiquetasChange,
}: {
  etiquetas: PreferenciasEtiquetas;
  onEtiquetasChange: (preferencias: PreferenciasEtiquetas) => void;
  onAdd: () => void;
  addActivo: boolean;
  medirActivo: boolean;
  medicionTexto: string | null;
  onToggleMedir: () => void;
  onBorrarMedicion: () => void;
}) {
  // Si el menú está desplegado, y referencia a su raíz para detectar clics fuera.
  const [abierto, setAbierto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const activo = addActivo || medirActivo;

  // Cierra el menú al hacer clic fuera de él.
  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("click", onClickFuera);
    return () => document.removeEventListener("click", onClickFuera);
  }, [abierto]);

  return (
    <div ref={raizRef}>
      {/* Botón del engrane: abre y cierra el menú. */}
      <a
        href="#"
        title="Herramientas del mapa"
        onClick={(e) => {
          e.preventDefault();
          setAbierto((v) => !v);
        }}
        className={activo ? "bg-brand-50" : ""}
        style={{
          display: "block",
          fontSize: 15,
          lineHeight: "26px",
          textAlign: "center",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        ⚙️
      </a>

      {/* Panel desplegable. */}
      {abierto && (
        <div className="absolute left-0 top-[34px] z-[1000] w-56 space-y-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          {/* Añadir luminaria. */}
          <button
            type="button"
            onClick={onAdd}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
              addActivo ? "bg-status-danger" : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            {addActivo ? "Cancelar (Haz clic en el mapa)" : "➕ Añadir Luminaria"}
          </button>

          {/* Medir distancia. */}
          <button
            type="button"
            onClick={onToggleMedir}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
              medirActivo ? "bg-status-danger" : "bg-amber-500 hover:bg-amber-400"
            }`}
          >
            {medirActivo ? "Detener medición" : "📏 Medir distancia"}
          </button>

          {/* Resultado de la medición, con opción de borrarla. */}
          {medicionTexto && (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs">
              <span className="text-slate-600">
                Distancia: <strong className="text-slate-900">{medicionTexto}</strong>
              </span>
              <button
                type="button"
                onClick={onBorrarMedicion}
                className="font-medium text-slate-400 hover:text-red-500"
              >
                Borrar
              </button>
            </div>
          )}

          {/* Etiquetas de colonias: mostrar u ocultar y tamaño del texto. */}
          <div className="space-y-2 border-t border-slate-200 px-1 pt-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">Etiquetas de colonias</p>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={etiquetas.visibles}
                onChange={(e) => onEtiquetasChange({ ...etiquetas, visibles: e.target.checked })}
              />
              Mostrar nombres
            </label>

            <label className="block">
              <span className="flex items-center justify-between">
                Tamaño del texto
                <strong className="tabular-nums text-slate-900">{etiquetas.tamano} px</strong>
              </span>
              <input
                type="range"
                min={TAMANO_ETIQUETA_MIN}
                max={TAMANO_ETIQUETA_MAX}
                step={1}
                value={etiquetas.tamano}
                disabled={!etiquetas.visibles}
                onChange={(e) => onEtiquetasChange({ ...etiquetas, tamano: Number(e.target.value) })}
                className="mt-1 w-full disabled:opacity-50"
              />
            </label>

            <p className="text-[11px] leading-snug text-slate-400">
              Se ven al activar la capa Colonias en el control de capas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
