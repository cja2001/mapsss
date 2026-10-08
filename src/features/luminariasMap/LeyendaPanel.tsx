import { useMemo } from "react";
import type { Luminaria } from "../../lib/types";
import type { MapaConfig } from "./colorConfig";
import { useConteosPorCapa, type CapaContable } from "./useConteosPorCapa";

// Color con que se muestra la capa de distritos en la leyenda.
const COLOR_DISTRITOS = "#1e3a8a";

/** Capa de distritos: no es parte de `capasExtra` (se carga aparte en districtsLayer.ts), pero se cuenta igual. */
const CAPA_DISTRITOS: CapaContable = {
  id: "distritos",
  label: "Distritos",
  url: "/distritos-sss.geojson",
  leyendaPorPropiedad: () => "Distritos",
};

/** Muestra de color de la leyenda: un punto o una línea. */
function Swatch({ color, forma = "punto" }: { color: string; forma?: "punto" | "linea" }) {
  if (forma === "linea") {
    return <span className="h-0.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />;
  }
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}

/** Panel de leyenda: lista las capas del mapa y las categorías de luminarias, con sus cantidades. */
export function LeyendaPanel({
  data,
  config,
  onCerrar,
}: {
  data: Luminaria[];
  config: MapaConfig;
  onCerrar: () => void;
}) {
  // Conteo de elementos de cada capa (distritos más las capas extra).
  const capasContables = useMemo(() => [CAPA_DISTRITOS, ...config.capasExtra], [config.capasExtra]);
  const conteos = useConteosPorCapa(capasContables);

  // Capas a listar, cada una con sus ítems de leyenda.
  const capasLeyenda = [
    {
      id: CAPA_DISTRITOS.id,
      label: CAPA_DISTRITOS.label,
      items: [{ label: "Distritos", color: COLOR_DISTRITOS }],
      forma: "punto" as const,
    },
    ...config.capasExtra.map((capa) => ({
      id: capa.id,
      label: capa.label,
      items: capa.leyenda ?? [{ label: capa.label, color: capa.color }],
      forma: capa.simboloLeyenda ?? "punto",
    })),
  ];

  return (
    <div className="absolute bottom-3 right-3 z-[1000] w-64 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
      {/* Encabezado con el botón de cerrar. */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold">Leyenda</h2>
        <button
          type="button"
          onClick={onCerrar}
          className="flex h-6 w-6 items-center justify-center rounded text-lg leading-none text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar leyenda"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-3">
        {/* Sección de capas del mapa. */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Capas del mapa
          </h3>
          <div className="space-y-2">
            {capasLeyenda.map((capa) => {
              // Cantidad de cada ítem; el total solo se muestra cuando ya cargaron todos.
              const conteosCapa = capa.items.map((item) => conteos[capa.id]?.[item.label]);
              const totalListo = conteosCapa.every((n) => n !== undefined);
              const total = conteosCapa.reduce((acc: number, n) => acc + (n ?? 0), 0);

              return (
                <div key={capa.id}>
                  {capa.items.length > 1 && (
                    <p className="mb-1 text-xs font-medium text-slate-600">{capa.label}</p>
                  )}
                  <div className="space-y-1 pl-1">
                    {capa.items.map((item, i) => {
                      const n = conteosCapa[i];
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-2 text-xs text-slate-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <Swatch color={item.color} forma={capa.forma} />
                            {item.label}
                          </span>
                          {n !== undefined && (
                            <span className="font-semibold tabular-nums text-slate-900">
                              {n.toLocaleString("es-SV")}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {capa.items.length > 1 && totalListo && (
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1 text-xs font-semibold text-slate-900">
                        <span>Total</span>
                        <span className="tabular-nums">{total.toLocaleString("es-SV")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección de categorías de luminarias (tipos en el censo, estados en el reporte). */}
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {config.editableLabel === "tipo" ? "Tipos de luminaria" : "Estado de luminarias"}
          </h3>
          <div className="space-y-1.5">
            {config.statsCategories.map(({ key, label, color, matches }) => {
              const n = data.filter((d) => matches(d[config.editableField])).length;
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Swatch color={color} />
                    {label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {n.toLocaleString("es-SV")}
                  </span>
                </div>
              );
            })}

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1 text-xs font-semibold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">{data.length.toLocaleString("es-SV")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
