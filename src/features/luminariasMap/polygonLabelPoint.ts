// Cálculo del mejor punto para colocar la etiqueta de un polígono (colonias y distritos).
import L from "leaflet";

// Un punto y un anillo (contorno cerrado) en coordenadas [lng, lat].
type Punto = [number, number]; // [lng, lat]
type Anillo = Punto[];

/**
 * Adaptado del algoritmo de mapbox/polylabel (licencia ISC): busca el punto
 * interior de un polígono más alejado de sus bordes ("polo de inaccesibilidad").
 * A diferencia del centroide geométrico (usado por Leaflet para direction:"center"),
 * este punto siempre queda dentro del polígono, incluso si es cóncavo o tiene
 * forma de "L", "U", herradura, etc. — ideal para centrar una etiqueta de texto.
 */
class Celda {
  x: number;
  y: number;
  h: number;
  d: number;
  max: number;

  constructor(x: number, y: number, h: number, anillos: Anillo[]) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.d = distanciaAlBorde(x, y, anillos);
    this.max = this.d + this.h * Math.SQRT2;
  }
}

/** Distancia de un punto al borde del polígono; positiva si está dentro, negativa si está fuera. */
function distanciaAlBorde(x: number, y: number, anillos: Anillo[]) {
  let dentro = false;
  let distMinCuadrada = Infinity;

  for (const anillo of anillos) {
    for (let i = 0, len = anillo.length, j = len - 1; i < len; j = i++) {
      const a = anillo[i];
      const b = anillo[j];

      if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) {
        dentro = !dentro;
      }

      distMinCuadrada = Math.min(distMinCuadrada, distanciaSegmentoCuadrada(x, y, a, b));
    }
  }

  return (dentro ? 1 : -1) * Math.sqrt(distMinCuadrada);
}

/** Distancia al cuadrado de un punto a un segmento. */
function distanciaSegmentoCuadrada(px: number, py: number, a: Punto, b: Punto) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
}

/** Centroide geométrico de un anillo. */
function centroide(anillo: Anillo): Punto {
  let x = 0;
  let y = 0;
  let area = 0;

  for (let i = 0, len = anillo.length, j = len - 1; i < len; j = i++) {
    const a = anillo[i];
    const b = anillo[j];
    const f = a[0] * b[1] - b[0] * a[1];
    x += (a[0] + b[0]) * f;
    y += (a[1] + b[1]) * f;
    area += f * 3;
  }

  return area === 0 ? anillo[0] : [x / area, y / area];
}

/** Área de un anillo. */
function areaAnillo(anillo: Anillo) {
  let suma = 0;
  for (let i = 0, len = anillo.length, j = len - 1; i < len; j = i++) {
    const a = anillo[i];
    const b = anillo[j];
    suma += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(suma / 2);
}

/** Busca el punto interior más alejado de los bordes, subdividiendo celdas hasta alcanzar la precisión deseada. */
function poloDeInaccesibilidad(anillos: Anillo[]): Punto {
  // Caja que contiene al polígono.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of anillos[0]) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  const ancho = maxX - minX;
  const alto = maxY - minY;
  if (ancho === 0 || alto === 0) return [minX, minY];

  // Se cubre la caja con celdas cuadradas iniciales.
  const tamCelda = Math.min(ancho, alto);
  const precision = tamCelda / 40;
  let h = tamCelda / 2;

  const cola: Celda[] = [];
  for (let x = minX; x < maxX; x += tamCelda) {
    for (let y = minY; y < maxY; y += tamCelda) {
      cola.push(new Celda(x + h, y + h, h, anillos));
    }
  }

  // Candidatos iniciales: el centroide y el centro de la caja.
  const [cx, cy] = centroide(anillos[0]);
  let mejor = new Celda(cx, cy, 0, anillos);

  const celdaCaja = new Celda(minX + ancho / 2, minY + alto / 2, 0, anillos);
  if (celdaCaja.d > mejor.d) mejor = celdaCaja;

  // Se procesa primero la celda más prometedora; las que aún pueden mejorar el resultado se dividen en cuatro.
  while (cola.length) {
    cola.sort((a, b) => b.max - a.max);
    const celda = cola.pop() as Celda;

    if (celda.d > mejor.d) mejor = celda;
    if (celda.max - mejor.d <= precision) continue;

    h = celda.h / 2;
    cola.push(new Celda(celda.x - h, celda.y - h, h, anillos));
    cola.push(new Celda(celda.x + h, celda.y - h, h, anillos));
    cola.push(new Celda(celda.x - h, celda.y + h, h, anillos));
    cola.push(new Celda(celda.x + h, celda.y + h, h, anillos));
  }

  return [mejor.x, mejor.y];
}

/** Punto óptimo para colocar una etiqueta dentro de `geometry` (Polygon o MultiPolygon). */
export function calcularPuntoEtiqueta(geometry: GeoJSON.Geometry): L.LatLng | null {
  let anillos: Anillo[] | null = null;

  // De un MultiPolygon se usa la parte de mayor área.
  if (geometry.type === "Polygon") {
    anillos = geometry.coordinates as Anillo[];
  } else if (geometry.type === "MultiPolygon") {
    const partes = geometry.coordinates as Anillo[][];
    if (partes.length > 0) {
      anillos = partes.reduce((mayor, actual) =>
        areaAnillo(actual[0]) > areaAnillo(mayor[0]) ? actual : mayor
      );
    }
  }

  if (!anillos || anillos.length === 0 || anillos[0].length < 3) return null;

  const [lng, lat] = poloDeInaccesibilidad(anillos);
  return L.latLng(lat, lng);
}

// Capas de Leaflet a las que se les guarda el punto de etiqueta, o que tienen tooltip.
export type LayerConPuntoEtiqueta = L.Layer & { _puntoEtiqueta?: L.LatLng };
type LayerConTooltip = L.Layer & { getTooltip?: () => L.Tooltip | undefined };

/** Calcula y guarda en `layer` el punto de etiqueta de `geometry`, listo para reaplicar luego. */
export function asociarPuntoEtiqueta(layer: L.Layer, geometry: GeoJSON.Geometry | null | undefined) {
  if (!geometry) return;
  const punto = calcularPuntoEtiqueta(geometry);
  if (punto) (layer as LayerConPuntoEtiqueta)._puntoEtiqueta = punto;
}

/**
 * Reaplica el punto guardado por `asociarPuntoEtiqueta` al tooltip de `layer`.
 * Necesario porque Leaflet recalcula la posición al centroide de la bbox cada
 * vez que la capa se (re)agrega al mapa, pisando nuestro punto centrado.
 */
export function reaplicarPuntoEtiqueta(layer: L.Layer) {
  const punto = (layer as LayerConPuntoEtiqueta)._puntoEtiqueta;
  const tooltip = (layer as LayerConTooltip).getTooltip?.();
  if (punto && tooltip) tooltip.setLatLng(punto);
}
