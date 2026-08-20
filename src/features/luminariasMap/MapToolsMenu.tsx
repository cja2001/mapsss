import { useEffect, useRef, useState } from "react";

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
}: {
  onAdd: () => void;
  addActivo: boolean;
  medirActivo: boolean;
  medicionTexto: string | null;
  onToggleMedir: () => void;
  onBorrarMedicion: () => void;
}) {
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

      {abierto && (
        <div className="absolute left-0 top-[34px] z-[1000] w-56 space-y-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          <button
            type="button"
            onClick={onAdd}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
              addActivo ? "bg-status-danger" : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            {addActivo ? "Cancelar (Haz clic en el mapa)" : "➕ Añadir Luminaria"}
          </button>

          <button
            type="button"
            onClick={onToggleMedir}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors ${
              medirActivo ? "bg-status-danger" : "bg-amber-500 hover:bg-amber-400"
            }`}
          >
            {medirActivo ? "Detener medición" : "📏 Medir distancia"}
          </button>

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
        </div>
      )}
    </div>
  );
}
