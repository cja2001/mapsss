import { useMemo, useState } from "react";
import type { Luminaria } from "../../lib/types";
import type { MapaConfig } from "./colorConfig";
import { useConteosPorCapa } from "./useConteosPorCapa";
import { exportarCensoExcel } from "./exportarCensoExcel";
import { SelectorDistrito } from "./SelectorDistrito";
import {
  TODOS_LOS_DISTRITOS,
  contarPorDistrito,
  filtrarPorDistrito,
  listarDistritos,
} from "./distritos";

/** Una barra de un gráfico: su etiqueta, color y valor. */
type FilaBarra = { key: string; label: string; color: string; valor: number };

// Colores de los gráficos.
const COLOR_TASADA = "#1d4ed8";
const COLOR_NO_TASADA = "#64748b";
const COLOR_DISTRITO = "#1d4ed8";
/** Las capas con conteo (Calles) solo tienen datos de este distrito; con otro distrito elegido no se muestran. */
const DISTRITO_DE_LAS_CAPAS = "san marcos";

/** Gráfico de barras horizontales con cantidad y porcentaje por categoría. Lo usan ambos dashboards. */
export function GraficoBarras({
  titulo,
  filas,
  forma = "punto",
}: {
  titulo: string;
  filas: FilaBarra[];
  forma?: "punto" | "linea";
}) {
  // El valor mayor define el ancho completo; el total sirve para los porcentajes.
  const max = Math.max(1, ...filas.map((f) => f.valor));
  const total = filas.reduce((acc, f) => acc + f.valor, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-900">{titulo}</h3>

      {/* Sin datos se muestra un aviso; con datos, una fila por categoría. */}
      {total === 0 ? (
        <p className="text-xs text-slate-400">Sin datos todavía.</p>
      ) : (
        <div className="space-y-2.5">
          {filas.map((f) => {
            const pct = ((f.valor / total) * 100).toFixed(1);
            const anchoPct = (f.valor / max) * 100;
            return (
              <div key={f.key}>
                {/* Etiqueta con su color a la izquierda; cantidad y porcentaje a la derecha. */}
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
                {/* La barra, con ancho proporcional al valor mayor. */}
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

/** Dashboard del censo: gráficos de tasadas, tipos, distritos y calles, con filtro por distrito y exportación a Excel. */
export function DashboardPanel({ data, config }: { data: Luminaria[]; config: MapaConfig }) {
  // Capas que tienen conteo por categoría (hoy, solo Calles) y sus conteos.
  const capasConLeyenda = useMemo(
    () => config.capasExtra.filter((capa) => capa.leyenda && capa.leyendaPorPropiedad),
    [config.capasExtra]
  );
  const conteosCapas = useConteosPorCapa(capasConLeyenda);

  // Filtro por distrito.
  const [distrito, setDistrito] = useState(TODOS_LOS_DISTRITOS);
  const distritos = useMemo(() => listarDistritos(data), [data]);
  /** Las luminarias del distrito elegido (o todas). Todo el dashboard se calcula sobre estas. */
  const datos = useMemo(() => filtrarPorDistrito(data, distrito), [data, distrito]);
  const verTodos = distrito === TODOS_LOS_DISTRITOS;
  const nombreDistritoElegido = distritos.find((d) => d.clave === distrito)?.nombre;

  // Datos de cada gráfico, calculados sobre el distrito elegido.
  const filasTasada: FilaBarra[] = [
    {
      key: "tasada",
      label: "Tasada",
      color: COLOR_TASADA,
      valor: datos.filter((d) => d.tasada).length,
    },
    {
      key: "no-tasada",
      label: "No tasada",
      color: COLOR_NO_TASADA,
      valor: datos.filter((d) => !d.tasada).length,
    },
  ];

  const filasTipo: FilaBarra[] = config.statsCategories.map((cat) => ({
    key: cat.key,
    label: cat.label,
    color: cat.color,
    valor: datos.filter((d) => cat.matches(d[config.editableField])).length,
  }));

  // Luminarias por distrito (siempre sobre todos los datos) y si corresponde mostrar las capas.
  const filasPorDistrito: FilaBarra[] = contarPorDistrito(data, distritos, COLOR_DISTRITO);
  const mostrarCapas = verTodos || distrito === DISTRITO_DE_LAS_CAPAS;

  // Un gráfico por cada capa con conteo.
  const graficosCapas = (mostrarCapas ? capasConLeyenda : []).map((capa) => ({
    id: capa.id,
    titulo: capa.label,
    forma: capa.simboloLeyenda,
    /** Falso mientras la capa se descarga (o si no se pudo descargar). */
    cargada: conteosCapas[capa.id] !== undefined,
    filas: (capa.leyenda ?? []).map((item) => ({
      key: item.label,
      label: item.label,
      color: item.color,
      valor: conteosCapas[capa.id]?.[item.label] ?? 0,
    })),
  }));

  // Estado de la exportación a Excel.
  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);

  // Genera el Excel con los mismos gráficos que se ven en pantalla.
  async function exportar() {
    setExportando(true);
    setErrorExportar(null);
    try {
      await exportarCensoExcel({
        distrito: nombreDistritoElegido,
        luminarias: datos,
        grupos: [
          ...(verTodos ? [{ titulo: "Luminarias por distrito", filas: filasPorDistrito }] : []),
          { titulo: "Tasadas vs. no tasadas", filas: filasTasada },
          { titulo: "Tipos de luminaria", filas: filasTipo },
          // Una capa que aún no terminó de cargar se omite, en vez de exportarla en ceros.
          ...graficosCapas.filter((g) => g.cargada),
        ],
      });
    } catch (err) {
      console.error("Error al exportar el censo:", err);
      setErrorExportar("No se pudo generar el archivo de Excel.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="absolute inset-0 z-[999] overflow-y-auto bg-white/95 p-4 pt-28">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Encabezado: título, selector de distrito y botón de exportar. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">{config.titulo}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <SelectorDistrito distritos={distritos} valor={distrito} onChange={setDistrito} />
            <button
              type="button"
              onClick={exportar}
              disabled={exportando || datos.length === 0}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportando ? "Generando…" : "Exportar a Excel"}
            </button>
          </div>
        </div>

        {/* Error de la exportación, si lo hubo. */}
        {errorExportar && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {errorExportar}
          </p>
        )}

        {/* Gráficos. */}
        <div className="grid gap-4 sm:grid-cols-2">
          {verTodos && <GraficoBarras titulo="Luminarias por distrito" filas={filasPorDistrito} />}
          <GraficoBarras titulo="Tasadas vs. no tasadas" filas={filasTasada} />
          <GraficoBarras titulo="Tipos de luminaria" filas={filasTipo} />
          {graficosCapas.map((grafico) => (
            <GraficoBarras
              key={grafico.id}
              titulo={grafico.titulo}
              forma={grafico.forma}
              filas={grafico.filas}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
