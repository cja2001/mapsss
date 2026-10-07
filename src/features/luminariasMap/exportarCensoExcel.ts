import type { Luminaria } from "../../lib/types";
import {
  COLUMNAS_LUMINARIA,
  agregarGrupos,
  agregarHojaLuminarias,
  descargarLibro,
  encabezadoResumen,
  estiloEncabezado,
  tituloSeccion,
  type GrupoDatos,
} from "./exportarReporteExcel";

export type DatosCenso = {
  /** Nombre del distrito al que se filtraron los datos; sin definir si son todos. */
  distrito?: string;
  luminarias: Luminaria[];
  /** Los mismos gráficos que muestra el dashboard, en el mismo orden. */
  grupos: GrupoDatos[];
};

/** El censo no carga el estado, así que esa columna se omite del listado. */
const COLUMNAS_CENSO = COLUMNAS_LUMINARIA.filter((columna) => columna.key !== "estado");

/** Arma el libro de Excel del censo: resumen con una tabla y un gráfico por cada panel del dashboard, más el listado de luminarias. */
export async function construirLibroCenso(datos: DatosCenso, generado = new Date()) {
  // Import dinámico: la librería pesa bastante y solo hace falta al exportar.
  const { default: ExcelJS } = await import("exceljs");
  const libro = new ExcelJS.Workbook();
  libro.creator = "MAPSSS Luminarias";
  libro.created = generado;

  const { luminarias, grupos, distrito } = datos;

  const resumen = libro.addWorksheet("Resumen");
  encabezadoResumen(resumen, "Censo de luminarias", generado, distrito);

  let fila = 5;
  tituloSeccion(resumen, fila++, "Indicadores");
  resumen.getRow(fila).values = ["Indicador", "Cantidad"];
  estiloEncabezado(resumen, fila++, 2);
  resumen.getRow(fila++).values = ["Total de luminarias", luminarias.length];
  fila++;

  // Una tabla por gráfico a la izquierda y su imagen a la derecha.
  agregarGrupos(libro, resumen, grupos, fila, 4);

  agregarHojaLuminarias(libro, "Luminarias", luminarias, COLUMNAS_CENSO);

  return libro.xlsx.writeBuffer();
}

/** Genera el Excel del censo y lo descarga en el navegador. */
export async function exportarCensoExcel(datos: DatosCenso) {
  const ahora = new Date();
  const buffer = await construirLibroCenso(datos, ahora);
  descargarLibro(buffer, "censo-luminarias", ahora);
}
