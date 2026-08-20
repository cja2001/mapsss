import { useMemo } from "react";
import type { Luminaria } from "../../lib/types";
import type { MapaConfig } from "./colorConfig";
import { useConteosPorCapa } from "./useConteosPorCapa";

type FilaBarra = { key: string; label: string; color: string; valor: number };

const COLOR_TASADA = "#1d4ed8";
const COLOR_NO_TASADA = "#64748b";

function GraficoBarras({
  titulo,
  filas,
  forma = "punto",
}: {
  titulo: string;
  filas: FilaBarra[];
  forma?: "punto" | "linea";
}) {
  const max = Math.max(1, ...filas.map((f) => f.valor));
  const total = filas.reduce((acc, f) => acc + f.valor, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{titulo}</h3>

      {total === 0 ? (
        <p className="text-xs text-slate-400">Sin datos todavía.</p>
      ) : (
        <div className="space-y-2.5">
          {filas.map((f) => {
            const pct = ((f.valor / total) * 100).toFixed(1);
            const anchoPct = (f.valor / max) * 100;
            return (
              <div key={f.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span
                      className={
                        forma === "linea"
                          ? "h-0.5 w-3.5 shrink-0 rounded-full"
                          : "h-2.5 w-2.5 shrink-0 rounded-full"
                      }
                      style={{ background: f.color }}
                    />
                    {f.label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {f.valor.toLocaleString("es-SV")}
                    <span className="ml-1 font-normal text-slate-400">{pct}%</span>
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-slate-100">
                  <div
                    title={`${f.label}: ${f.valor.toLocaleString("es-SV")} (${pct}%)`}
                    className="h-full rounded-r-[4px] transition-[filter] hover:brightness-110"
                    style={{ width: `${anchoPct}%`, background: f.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardPanel({ data, config }: { data: Luminaria[]; config: MapaConfig }) {
  const capasConLeyenda = useMemo(
    () => config.capasExtra.filter((capa) => capa.leyenda && capa.leyendaPorPropiedad),
    [config.capasExtra]
  );
  const conteosCapas = useConteosPorCapa(capasConLeyenda);

  const filasTasada: FilaBarra[] = [
    {
      key: "tasada",
      label: "Tasada",
      color: COLOR_TASADA,
      valor: data.filter((d) => d.tasada).length,
    },
    {
      key: "no-tasada",
      label: "No tasada",
      color: COLOR_NO_TASADA,
      valor: data.filter((d) => !d.tasada).length,
    },
  ];

  const filasTipo: FilaBarra[] = config.statsCategories.map((cat) => ({
    key: cat.key,
    label: cat.label,
    color: cat.color,
    valor: data.filter((d) => cat.matches(d[config.editableField])).length,
  }));

  return (
    <div className="absolute inset-0 z-[999] overflow-y-auto bg-white/95 p-4 pt-28">
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <GraficoBarras titulo="Tasadas vs. no tasadas" filas={filasTasada} />
        <GraficoBarras titulo="Tipos de luminaria" filas={filasTipo} />
        {capasConLeyenda.map((capa) => (
          <GraficoBarras
            key={capa.id}
            titulo={capa.label}
            forma={capa.simboloLeyenda}
            filas={(capa.leyenda ?? []).map((item) => ({
              key: item.label,
              label: item.label,
              color: item.color,
              valor: conteosCapas[capa.id]?.[item.label] ?? 0,
            }))}
          />
        ))}
      </div>
    </div>
  );
}
