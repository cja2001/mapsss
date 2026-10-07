import { useMemo, useState } from "react";
import type { Luminaria } from "../../lib/types";
import { exportarReporteExcel } from "./exportarReporteExcel";
import type { MapaConfig } from "./colorConfig";
import { useOnlineStatus } from "../../lib/useOnlineStatus";
import { GraficoBarras } from "./DashboardPanel";
import {
  contarReparacionesPorMes,
  useReparaciones,
  type MesReparaciones,
} from "./useReparacionesPorMes";
import { SelectorDistrito } from "./SelectorDistrito";
import {
  TODOS_LOS_DISTRITOS,
  contarPorDistrito,
  filtrarPorDistrito,
  listarDistritos,
} from "./distritos";

const COLOR_REPARADAS = "#1d4ed8";
const COLOR_POR_REPARAR = "#ef4444";
/** Claves de `statsCategories` del reporte que cuentan como reportadas y aún sin reparar. */
const CLAVES_POR_REPARAR = ["danadas", "proceso"];

function Indicador({
  titulo,
  valor,
  detalle,
  color,
}: {
  titulo: string;
  valor: number;
  detalle?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {color && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        )}
        {titulo}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
        {valor.toLocaleString("es-SV")}
      </p>
      {detalle && <p className="mt-0.5 text-xs text-slate-400">{detalle}</p>}
    </div>
  );
}

function GraficoReparadasPorMes({
  meses,
  cargando,
  error,
}: {
  meses: MesReparaciones[];
  cargando: boolean;
  error: string | null;
}) {
  const max = Math.max(1, ...meses.map((m) => m.valor));
  const total = meses.reduce((acc, m) => acc + m.valor, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">Luminarias reparadas por mes</h3>
        {!cargando && !error && (
          <span className="text-xs text-slate-500">
            <strong className="tabular-nums text-slate-900">{total.toLocaleString("es-SV")}</strong>{" "}
            en los últimos 12 meses
          </span>
        )}
      </div>

      {cargando ? (
        <p className="text-xs text-slate-500">Cargando…</p>
      ) : error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : (
        <>
          <div className="flex items-end gap-0.5 sm:gap-1.5" role="list">
            {meses.map((m) => (
              <div
                key={m.clave}
                role="listitem"
                aria-label={`${m.label}: ${m.valor} reparadas`}
                title={`${m.label}: ${m.valor.toLocaleString("es-SV")} reparadas`}
                className="group flex min-w-0 flex-1 flex-col items-center"
              >
                <span className="mb-1 text-[11px] font-semibold tabular-nums text-slate-700">
                  {m.valor > 0 ? m.valor.toLocaleString("es-SV") : ""}
                </span>
                <div className="flex h-32 w-full items-end border-b border-slate-200">
                  <div
                    className="mx-auto w-full max-w-9 rounded-t-[4px] transition-[filter] group-hover:brightness-125"
                    style={{
                      height: m.valor > 0 ? `max(3px, ${(m.valor / max) * 100}%)` : 0,
                      background: COLOR_REPARADAS,
                    }}
                  />
                </div>
                <span className="mt-1 w-full truncate text-center text-[10px] text-slate-500">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {total === 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Aún no hay reparaciones registradas. Se cuentan desde que una luminaria dañada o en
              mantenimiento se marca como buena.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ReporteDashboard({
  data,
  config,
  loading,
  error,
  pendientes,
}: {
  data: Luminaria[];
  config: MapaConfig;
  loading: boolean;
  error: string | null;
  /** Nº de cambios hechos sin conexión que aún no se han enviado al servidor. */
  pendientes: number;
}) {
  const enLinea = useOnlineStatus();
  const reparaciones = useReparaciones();

  const [distrito, setDistrito] = useState(TODOS_LOS_DISTRITOS);
  const distritos = useMemo(() => listarDistritos(data), [data]);
  /** Las luminarias del distrito elegido (o todas). Todo el dashboard se calcula sobre estas. */
  const datos = useMemo(() => filtrarPorDistrito(data, distrito), [data, distrito]);
  const verTodos = distrito === TODOS_LOS_DISTRITOS;
  const nombreDistritoElegido = distritos.find((d) => d.clave === distrito)?.nombre;

  const meses = useMemo(() => {
    if (verTodos) return contarReparacionesPorMes(reparaciones.reparaciones);
    const idsDelDistrito = new Set(datos.map((d) => d.id));
    return contarReparacionesPorMes(reparaciones.reparaciones, (id) => idsDelDistrito.has(id));
  }, [reparaciones.reparaciones, datos, verTodos]);

  const categoriasPorReparar = config.statsCategories.filter((cat) =>
    CLAVES_POR_REPARAR.includes(cat.key)
  );
  const estaPorReparar = (d: Luminaria) =>
    categoriasPorReparar.some((cat) => cat.matches(d[config.editableField]));
  const filasPorRepararPorDistrito = contarPorDistrito(
    data,
    distritos,
    COLOR_POR_REPARAR,
    estaPorReparar
  );
  const filasPorDistrito = contarPorDistrito(data, distritos, COLOR_REPARADAS);

  const filasEstado = config.statsCategories.map((cat) => ({
    key: cat.key,
    label: cat.label,
    color: cat.color,
    valor: datos.filter((d) => cat.matches(d[config.editableField])).length,
  }));

  const porReparar = filasEstado.filter((f) => CLAVES_POR_REPARAR.includes(f.key));
  const totalPorReparar = porReparar.reduce((acc, f) => acc + f.valor, 0);
  const reparadasEsteMes = meses[meses.length - 1]?.valor ?? 0;

  const [exportando, setExportando] = useState(false);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);
  const exportarDeshabilitado = loading || reparaciones.cargando || exportando;

  async function exportar() {
    setExportando(true);
    setErrorExportar(null);
    try {
      await exportarReporteExcel({
        distrito: nombreDistritoElegido,
        grupos: verTodos
          ? [
              { titulo: "Por reparar por distrito", filas: filasPorRepararPorDistrito },
              { titulo: "Luminarias por distrito", filas: filasPorDistrito },
            ]
          : [],
        luminarias: datos,
        porReparar: datos.filter(estaPorReparar),
        filasEstado,
        meses,
        reparacionesDisponibles: !reparaciones.error,
      });
    } catch (err) {
      console.error("Error al exportar el reporte:", err);
      setErrorExportar("No se pudo generar el archivo de Excel.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="absolute inset-0 z-[999] overflow-y-auto bg-white/95 p-4 pt-28">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">{config.titulo}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <SelectorDistrito distritos={distritos} valor={distrito} onChange={setDistrito} />
            <button
              type="button"
              onClick={exportar}
              disabled={exportarDeshabilitado}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportando ? "Generando…" : "Exportar a Excel"}
            </button>
          </div>
        </div>

        {errorExportar && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {errorExportar}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            Error: {error}
          </p>
        )}

        {!enLinea && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            📴 Sin conexión: los cambios se guardan y se enviarán al recuperar la señal.
          </p>
        )}

        {pendientes > 0 && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-brand-600">
            🔄 {pendientes} {pendientes === 1 ? "cambio pendiente" : "cambios pendientes"} de
            sincronizar
          </p>
        )}

        {loading ? (
          <p className="text-xs text-slate-500">Cargando datos…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Indicador
                titulo="Reportadas por reparar"
                valor={totalPorReparar}
                detalle={porReparar.map((f) => `${f.valor} ${f.label.toLowerCase()}`).join(" · ")}
              />
              {porReparar.map((f) => (
                <Indicador key={f.key} titulo={f.label} valor={f.valor} color={f.color} />
              ))}
              <Indicador
                titulo="Reparadas este mes"
                valor={reparadasEsteMes}
                color={COLOR_REPARADAS}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <GraficoReparadasPorMes
                meses={meses}
                cargando={reparaciones.cargando}
                error={reparaciones.error}
              />
              <GraficoBarras titulo="Estado de las luminarias" filas={filasEstado} />
              <Indicador titulo="Total de luminarias" valor={datos.length} />
              {verTodos && (
                <>
                  <GraficoBarras
                    titulo="Por reparar por distrito"
                    filas={filasPorRepararPorDistrito}
                  />
                  <GraficoBarras titulo="Luminarias por distrito" filas={filasPorDistrito} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
