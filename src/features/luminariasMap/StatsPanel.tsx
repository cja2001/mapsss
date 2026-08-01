import { useState } from "react";
import type { Luminaria } from "../../lib/types";
import type { StatCategoria } from "./colorConfig";

export function StatsPanel({
  data,
  loading,
  error,
  titulo,
  categories,
  campo,
  onAdd,
  addActivo,
  medirActivo,
  medicionTexto,
  onToggleMedir,
  onBorrarMedicion,
}: {
  data: Luminaria[];
  loading: boolean;
  error: string | null;
  titulo: string;
  categories: StatCategoria[];
  campo: "tipo" | "estado";
  onAdd: () => void;
  addActivo: boolean;
  medirActivo: boolean;
  medicionTexto: string | null;
  onToggleMedir: () => void;
  onBorrarMedicion: () => void;
}) {
  const [abierto, setAbierto] = useState(true);
  const total = data.length;

  return (
    <div className="absolute bottom-3 left-3 z-[1000] w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold">{titulo}</h2>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded text-lg leading-none text-slate-500 hover:bg-slate-100"
          aria-label={abierto ? "Minimizar panel" : "Expandir panel"}
        >
          {abierto ? "−" : "+"}
        </button>
      </div>

      {abierto && (
        <div className="space-y-3 px-4 py-3">
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

          {error && <p className="text-xs font-medium text-red-600">Error: {error}</p>}

          {loading ? (
            <p className="text-xs text-slate-500">Cargando datos…</p>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-slate-500">Total</span>
                <span className="text-lg font-bold">{total.toLocaleString("es-SV")}</span>
              </div>

              <div className="space-y-1.5">
                {categories.map(({ key, label, color, matches }) => {
                  const n = data.filter((d) => matches(d[campo])).length;
                  const pct = total > 0 ? ((n / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: color }}
                        />
                        {label}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {n.toLocaleString("es-SV")}{" "}
                        <span className="font-normal text-slate-400">{pct}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                {categories.map(({ key, color, matches }) => {
                  const n = data.filter((d) => matches(d[campo])).length;
                  const pct = total > 0 ? (n / total) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div key={key} style={{ width: `${pct}%`, background: color }} />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
