// Exportación del reporte a Excel. También contiene las utilidades de gráficos y de hojas que reutiliza la exportación del censo.
import type { Workbook, Worksheet } from "exceljs";
import type { Luminaria } from "../../lib/types";
import type { MesReparaciones } from "./useReparacionesPorMes";
import { nombreDistrito } from "./distritos";

/** Una categoría con su valor, para una tabla o un gráfico. */
export type FilaEstado = { key: string; label: string; color: string; valor: number };

/** Una tabla con su gráfico de barras: el título y las categorías que cuenta. */
export type GrupoDatos = { titulo: string; filas: FilaEstado[] };

/** Todo lo que necesita el Excel del reporte. */
export type DatosReporte = {
  /** Nombre del distrito al que se filtraron los datos; sin definir si son todos. */
  distrito?: string;
  /** Tablas y gráficos adicionales al final del resumen (p. ej. el desglose por distrito). */
  grupos?: GrupoDatos[];
  luminarias: Luminaria[];
  /** Luminarias reportadas que aún no se han reparado (dañadas o en mantenimiento). */
  porReparar: Luminaria[];
  filasEstado: FilaEstado[];
  meses: MesReparaciones[];
  /** Falso si no se pudo leer el historial de reparaciones (sin conexión, por ejemplo). */
  reparacionesDisponibles: boolean;
};

// Colores, fuente y escala (2x, para que las imágenes se vean nítidas) de los gráficos.
const COLOR_REPARADAS = "#1d4ed8";
const COLOR_ENCABEZADO = "FF1D4ED8";
const FUENTE = "Arial, Helvetica, sans-serif";
const ESCALA = 2;

// ---------- Gráficos (se dibujan en un canvas y se incrustan como imagen) ----------

/** Crea un lienzo con fondo blanco y el título del gráfico ya dibujado. */
function crearLienzo(ancho: number, alto: number, titulo: string) {
  const canvas = document.createElement("canvas");
  canvas.width = ancho * ESCALA;
  canvas.height = alto * ESCALA;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no permite generar los gráficos.");

  ctx.scale(ESCALA, ESCALA);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 15px ${FUENTE}`;
  ctx.textBaseline = "top";
  ctx.fillText(titulo, 16, 14);

  return { canvas, ctx };
}

/** Tope del eje: el siguiente valor "redondo" por encima del máximo, para que las líneas guía caigan en enteros. */
function topeEje(max: number) {
  if (max <= 4) return 4;
  const magnitud = 10 ** Math.floor(Math.log10(max));
  const paso = [1, 2, 4, 5, 8, 10].find((p) => p * magnitud >= max) ?? 10;
  return paso * magnitud;
}

/** Dibuja el gráfico de columnas de reparaciones por mes y lo devuelve como imagen PNG. */
function graficoColumnas(titulo: string, meses: MesReparaciones[]) {
  const ancho = 640;
  const alto = 300;
  const { canvas, ctx } = crearLienzo(ancho, alto, titulo);

  // Márgenes y área útil del gráfico.
  const izquierda = 44;
  const derecha = 16;
  const arriba = 56;
  const abajo = 34;
  const anchoPlot = ancho - izquierda - derecha;
  const altoPlot = alto - arriba - abajo;
  const tope = topeEje(Math.max(0, ...meses.map((m) => m.valor)));

  // Líneas guía y escala
  ctx.font = `11px ${FUENTE}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const y = arriba + altoPlot - (altoPlot * i) / 4;
    ctx.strokeStyle = i === 0 ? "#94a3b8" : "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(izquierda, Math.round(y) + 0.5);
    ctx.lineTo(ancho - derecha, Math.round(y) + 0.5);
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.fillText(((tope * i) / 4).toLocaleString("es-SV"), izquierda - 8, y);
  }

  // Una columna por mes, con su valor encima y el nombre del mes debajo.
  const paso = anchoPlot / Math.max(1, meses.length);
  const anchoBarra = Math.min(34, paso * 0.62);
  ctx.textAlign = "center";

  meses.forEach((m, i) => {
    const centro = izquierda + paso * i + paso / 2;
    const altura = m.valor > 0 ? Math.max(2, (m.valor / tope) * altoPlot) : 0;
    const y = arriba + altoPlot - altura;

    if (altura > 0) {
      ctx.fillStyle = COLOR_REPARADAS;
      ctx.beginPath();
      ctx.roundRect(centro - anchoBarra / 2, y, anchoBarra, altura, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 11px ${FUENTE}`;
      ctx.textBaseline = "bottom";
      ctx.fillText(m.valor.toLocaleString("es-SV"), centro, y - 3);
    }

    ctx.fillStyle = "#64748b";
    ctx.font = `11px ${FUENTE}`;
    ctx.textBaseline = "top";
    ctx.fillText(m.label, centro, arriba + altoPlot + 8);
  });

  return canvas.toDataURL("image/png");
}

/** Dibuja un gráfico de barras horizontales (una por categoría) y lo devuelve como imagen PNG junto con su alto. */
export function graficoBarrasHorizontales(titulo: string, filas: FilaEstado[]) {
  const ancho = 640;
  const altoFila = 40;
  const arriba = 52;
  const alto = arriba + filas.length * altoFila + 12;
  const { canvas, ctx } = crearLienzo(ancho, alto, titulo);

  // Zona de las barras y valores de referencia para proporciones y porcentajes.
  const inicioBarra = 150;
  const finBarra = ancho - 130;
  const total = filas.reduce((acc, f) => acc + f.valor, 0);
  const max = Math.max(1, ...filas.map((f) => f.valor));

  // Por cada categoría: etiqueta, fondo de la barra, barra y valor con porcentaje.
  filas.forEach((f, i) => {
    const centroY = arriba + i * altoFila + altoFila / 2;
    const largo = f.valor > 0 ? Math.max(2, (f.valor / max) * (finBarra - inicioBarra)) : 0;

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = `12px ${FUENTE}`;
    ctx.fillText(f.label, 16, centroY);

    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(inicioBarra, centroY - 9, finBarra - inicioBarra, 18);

    if (largo > 0) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.roundRect(inicioBarra, centroY - 9, largo, 18, [0, 4, 4, 0]);
      ctx.fill();
    }

    const pct = total > 0 ? ((f.valor / total) * 100).toFixed(1) : "0.0";
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold 12px ${FUENTE}`;
    ctx.fillText(`${f.valor.toLocaleString("es-SV")}  (${pct}%)`, finBarra + 10, centroY);
  });

  return { imagen: canvas.toDataURL("image/png"), alto };
}

// ---------- Libro de Excel ----------

/** Da formato de encabezado (fondo azul, texto blanco en negrita) a las primeras celdas de una fila. */
export function estiloEncabezado(hoja: Worksheet, fila: number, columnas: number) {
  for (let c = 1; c <= columnas; c++) {
    const celda = hoja.getCell(fila, c);
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_ENCABEZADO } };
    celda.alignment = { vertical: "middle" };
  }
}

/** Escribe el título de una sección en la primera columna. */
export function tituloSeccion(hoja: Worksheet, fila: number, texto: string) {
  const celda = hoja.getCell(fila, 1);
  celda.value = texto;
  celda.font = { bold: true, size: 12 };
}

/** Texto a mostrar para el campo servicio. */
function etiquetaServicio(servicio: Luminaria["servicio"]) {
  if (servicio === "nuevo") return "Nuevo";
  if (servicio === "antiguo") return "Antiguo";
  return "Sin clasificar";
}

/** Alto por defecto de una fila de Excel, en píxeles, para calcular cuántas filas ocupa cada imagen. */
const ALTO_FILA_PX = 20;

/** Filas de hoja que hay que saltar para colocar la siguiente imagen debajo de una de `altoPx`. */
export function filasQueOcupa(altoPx: number) {
  return Math.ceil(altoPx / ALTO_FILA_PX) + 2;
}

/** Escribe título, fecha y (si aplica) el distrito en las primeras filas de la hoja de resumen. */
export function encabezadoResumen(hoja: Worksheet, titulo: string, generado: Date, distrito?: string) {
  hoja.getColumn(1).width = 32;
  hoja.getColumn(2).width = 14;
  hoja.getColumn(3).width = 12;
  hoja.getColumn(4).width = 4;

  hoja.getCell("A1").value = titulo;
  hoja.getCell("A1").font = { bold: true, size: 16 };
  hoja.getCell("A2").value = `Generado el ${generado.toLocaleString("es-SV", {
    dateStyle: "long",
    timeStyle: "short",
  })}`;
  hoja.getCell("A2").font = { color: { argb: "FF64748B" } };
  hoja.getCell("A3").value = `Distrito: ${distrito ?? "Todos"}`;
  hoja.getCell("A3").font = { bold: true };
}

/**
 * Añade al resumen una tabla (cantidad y porcentaje) por cada grupo a partir de
 * `fila`, y su gráfico a la derecha (columna F) a partir de `filaImagen`.
 */
export function agregarGrupos(
  libro: Workbook,
  hoja: Worksheet,
  grupos: GrupoDatos[],
  fila: number,
  filaImagen: number
) {
  for (const grupo of grupos) {
    const total = grupo.filas.reduce((acc, f) => acc + f.valor, 0);

    tituloSeccion(hoja, fila++, grupo.titulo);
    hoja.getRow(fila).values = ["Categoría", "Cantidad", "Porcentaje"];
    estiloEncabezado(hoja, fila++, 3);
    grupo.filas.forEach((f) => {
      hoja.getRow(fila).values = [f.label, f.valor, total > 0 ? f.valor / total : 0];
      hoja.getCell(fila, 3).numFmt = "0.0%";
      fila++;
    });
    hoja.getRow(fila).values = ["Total", total, total > 0 ? 1 : 0];
    hoja.getRow(fila).font = { bold: true };
    hoja.getCell(fila, 3).numFmt = "0.0%";
    fila += 2;

    const grafico = graficoBarrasHorizontales(grupo.titulo, grupo.filas);
    const idImagen = libro.addImage({ base64: grafico.imagen, extension: "png" });
    hoja.addImage(idImagen, {
      tl: { col: 5, row: filaImagen },
      ext: { width: 640, height: grafico.alto },
    });
    filaImagen += filasQueOcupa(grafico.alto);
  }
}

/** Una columna del listado de luminarias. */
export type ColumnaLuminaria = { header: string; key: string; width: number };

/** Columnas del listado de luminarias. Cada exportación elige las que tienen datos en su modo. */
export const COLUMNAS_LUMINARIA: ColumnaLuminaria[] = [
  { header: "ID", key: "id", width: 10 },
  { header: "Estado", key: "estado", width: 16 },
  { header: "Tipo", key: "tipo", width: 16 },
  { header: "Potencia", key: "potencia", width: 12 },
  { header: "Distrito", key: "distrito", width: 22 },
  { header: "Servicio", key: "servicio", width: 15 },
  { header: "Tasada", key: "tasada", width: 10 },
  { header: "Latitud", key: "lat", width: 14 },
  { header: "Longitud", key: "lng", width: 14 },
];

/** Añade una hoja con el listado de luminarias: encabezado fijo, una fila por luminaria y filtros. */
export function agregarHojaLuminarias(
  libro: Workbook,
  nombre: string,
  luminarias: Luminaria[],
  columnas: ColumnaLuminaria[] = COLUMNAS_LUMINARIA
) {
  // Hoja con la primera fila inmovilizada y el encabezado con formato.
  const hoja = libro.addWorksheet(nombre, { views: [{ state: "frozen", ySplit: 1 }] });
  hoja.columns = columnas;
  estiloEncabezado(hoja, 1, hoja.columns.length);

  // Una fila por luminaria, con textos legibles en lugar de valores vacíos.
  hoja.addRows(
    luminarias.map((l) => ({
      id: l.id > 0 ? l.id : "Pendiente de sincronizar",
      estado: l.estado ?? "N/D",
      tipo: l.tipo ?? "N/D",
      potencia: l.potencia ?? "N/D",
      distrito: nombreDistrito(l.distrito),
      servicio: etiquetaServicio(l.servicio),
      tasada: l.tasada ? "Sí" : "No",
      lat: l.lat,
      lng: l.lng,
    }))
  );

  // Filtros automáticos en el encabezado.
  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: hoja.columns.length } };
  return hoja;
}

/** Arma el libro de Excel del reporte: resumen con tablas y gráficos, más el detalle de luminarias. */
export async function construirLibroReporte(datos: DatosReporte, generado = new Date()) {
  // Import dinámico: la librería pesa bastante y solo hace falta al exportar.
  const { default: ExcelJS } = await import("exceljs");
  const libro = new ExcelJS.Workbook();
  libro.creator = "MAPSSS Luminarias";
  libro.created = generado;

  const { luminarias, porReparar, filasEstado, meses, reparacionesDisponibles } = datos;
  const { distrito, grupos = [] } = datos;
  const total = luminarias.length;
  const mesActual = meses[meses.length - 1];

  // ----- Hoja "Resumen" -----
  const resumen = libro.addWorksheet("Resumen");
  encabezadoResumen(resumen, "Reporte de luminarias", generado, distrito);

  // Tabla de indicadores.
  let fila = 5;
  tituloSeccion(resumen, fila++, "Indicadores");
  resumen.getRow(fila).values = ["Indicador", "Cantidad"];
  estiloEncabezado(resumen, fila++, 2);
  const indicadores: [string, number | string][] = [
    ["Total de luminarias", total],
    ["Reportadas por reparar", porReparar.length],
    ...filasEstado
      .filter((f) => f.key === "danadas" || f.key === "proceso")
      .map((f): [string, number] => [`   ${f.label}`, f.valor]),
    [
      `Reparadas este mes${mesActual ? ` (${mesActual.label})` : ""}`,
      reparacionesDisponibles ? (mesActual?.valor ?? 0) : "No disponible",
    ],
  ];
  indicadores.forEach((valores) => {
    resumen.getRow(fila++).values = valores;
  });

  // Tabla de estados con cantidad y porcentaje.
  fila++;
  tituloSeccion(resumen, fila++, "Estado de las luminarias");
  resumen.getRow(fila).values = ["Estado", "Cantidad", "Porcentaje"];
  estiloEncabezado(resumen, fila++, 3);
  filasEstado.forEach((f) => {
    resumen.getRow(fila).values = [f.label, f.valor, total > 0 ? f.valor / total : 0];
    resumen.getCell(fila, 3).numFmt = "0.0%";
    fila++;
  });
  resumen.getRow(fila).values = ["Total", total, total > 0 ? 1 : 0];
  resumen.getRow(fila).font = { bold: true };
  resumen.getCell(fila, 3).numFmt = "0.0%";
  fila += 2;

  // Tabla de reparaciones por mes (o un aviso si no se pudo cargar el historial).
  tituloSeccion(resumen, fila++, "Luminarias reparadas por mes");
  if (reparacionesDisponibles) {
    resumen.getRow(fila).values = ["Mes", "Reparadas"];
    estiloEncabezado(resumen, fila++, 2);
    meses.forEach((m) => {
      resumen.getRow(fila++).values = [m.label, m.valor];
    });
    resumen.getRow(fila).values = ["Total 12 meses", meses.reduce((acc, m) => acc + m.valor, 0)];
    resumen.getRow(fila).font = { bold: true };
  } else {
    resumen.getCell(fila, 1).value = "No se pudo cargar el historial de reparaciones.";
  }
  fila += 2;

  // Gráficos, a la derecha de las tablas (desde la columna F).
  const estado = graficoBarrasHorizontales("Estado de las luminarias", filasEstado);
  let filaImagen = 4;
  if (reparacionesDisponibles) {
    const idColumnas = libro.addImage({
      base64: graficoColumnas("Luminarias reparadas por mes (últimos 12 meses)", meses),
      extension: "png",
    });
    resumen.addImage(idColumnas, { tl: { col: 5, row: filaImagen }, ext: { width: 640, height: 300 } });
    filaImagen += 17;
  }
  const idEstado = libro.addImage({ base64: estado.imagen, extension: "png" });
  resumen.addImage(idEstado, {
    tl: { col: 5, row: filaImagen },
    ext: { width: 640, height: estado.alto },
  });
  filaImagen += filasQueOcupa(estado.alto);

  // Tablas y gráficos adicionales (desgloses por distrito).
  agregarGrupos(libro, resumen, grupos, fila, filaImagen);

  // ----- Hojas de detalle -----
  agregarHojaLuminarias(libro, "Por reparar", porReparar);
  agregarHojaLuminarias(libro, "Luminarias", luminarias);

  return libro.xlsx.writeBuffer();
}

/** Genera el Excel del reporte y lo descarga en el navegador. */
export async function exportarReporteExcel(datos: DatosReporte) {
  const ahora = new Date();
  const buffer = await construirLibroReporte(datos, ahora);

  descargarLibro(buffer, "reporte-luminarias", ahora);
}

/** Descarga en el navegador un libro ya generado, con la fecha en el nombre del archivo. */
export function descargarLibro(buffer: ArrayBuffer, prefijo: string, fecha: Date) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const dia = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
    fecha.getDate()
  ).padStart(2, "0")}`;

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${prefijo}-${dia}.xlsx`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
