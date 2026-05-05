const supabaseUrl = 'https://nwnlqaohxzxflmxwrtyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

const map = L.map('map').setView([13.692, -89.191], 10);

// CAPAS BASE
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
});

const satelital = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
  }
);

// CAPA BASE POR DEFECTO
satelital.addTo(map);

// CAPAS PARA EL CONTROL
const baseMaps = {
  "Mapa normal": osm,
  "Satelital": satelital
};

const overlays = {};

let capaMunicipios = null;
let capaLuminarias = null;
let controlCapas = null;

// COLOR SEGÚN ESTADO (se mantiene por si lo usas después)
function obtenerColorPorEstado(estado) {
  const valor = (estado || '').toString().toLowerCase().trim();

  switch (valor) {
    case 'buena':
      return '#22c55e';
    case 'danada':
    case 'dañada':
      return '#ef4444';
    case 'mantenimiento':
      return '#eab308';
    default:
      return '#6b7280';
  }
}

// 🔥 NUEVO: COLOR POR TIPO
function obtenerColorPorTipo(tipo) {
  const valor = (tipo || '').toString().toLowerCase().trim();

  switch (valor) {
    case 'led':
      return '#22c55e'; // verde
    case 'mercurio':
      return '#3b82f6'; // azul
    case 'fluorescente':
    case 'fluoresente':
      return '#a855f7'; // morado
    default:
      return '#6b7280'; // gris
  }
}

// CARGAR GEOJSON
async function cargarGeoJSON(url) {
  const response = await fetch(url);
  const texto = await response.text();

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`);
  }

  try {
    return JSON.parse(texto);
  } catch (e) {
    throw new Error(`El archivo ${url} no tiene un JSON válido.`);
  }
}

// NOMBRE MUNICIPIO
function obtenerNombreMunicipio(props) {
  return (
    props.nombre ||
    props.NOMBRE ||
    props.municipio ||
    props.MUNICIPIO ||
    props.nom_mun ||
    props.NOM_MUN ||
    'Municipio'
  );
}

// MUNICIPIOS
async function cargarMunicipios() {
  const datosMunicipios = await cargarGeoJSON('Distritos SSS.geojson');

  capaMunicipios = L.geoJSON(datosMunicipios, {
    style: () => ({
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0
    }),

    onEachFeature: function (feature, layer) {
      const props = feature.properties || {};
      const nombreMunicipio = obtenerNombreMunicipio(props);

      layer.bindTooltip(nombreMunicipio, {
        permanent: true,
        direction: 'center',
        className: 'etiqueta-municipio'
      });

      let contenido = `<strong>${nombreMunicipio}</strong>`;
      Object.keys(props).forEach(clave => {
        contenido += `<br>${clave}: ${props[clave]}`;
      });

      layer.bindPopup(contenido);

      layer.on({
        mouseover: e => e.target.setStyle({ weight: 4 }),
        mouseout: e => capaMunicipios.resetStyle(e.target)
      });
    }
  }).addTo(map);

  overlays["Límites municipales"] = capaMunicipios;
}

// LUMINARIAS
async function cargarLuminarias() {
  if (capaLuminarias) {
    map.removeLayer(capaLuminarias);
  }

  capaLuminarias = L.layerGroup();

  let todosLosDatos = [];
  let desde = 0;
  const bloque = 1000;
  let hayMas = true;

  while (hayMas) {
    const { data, error } = await supabaseClient
      .from('luminarias')
      .select('id, potencia, lat, lng, estado, distrito, tipo')
      .range(desde, desde + bloque - 1);

    if (error) throw error;

    if (!data || data.length === 0) {
      hayMas = false;
      break;
    }

    todosLosDatos = todosLosDatos.concat(data);

    if (data.length < bloque) {
      hayMas = false;
    } else {
      desde += bloque;
    }
  }

  let dibujados = 0;
  let omitidos = 0;

  todosLosDatos.forEach(item => {
    if (item.lat == null || item.lng == null) {
      omitidos++;
      return;
    }

    // 🔥 USAR COLOR POR TIPO
    const color = obtenerColorPorTipo(item.tipo);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: 3,
      color: color,
      fillColor: color,
      fillOpacity: 0.6,
      weight: 1
    });

    const popup = `
      <strong>Luminaria ${item.id}</strong><br>
      Potencia: ${item.potencia || 'N/D'}<br>
      Estado: ${item.estado || 'N/D'}<br>
      Distrito: ${item.distrito || 'N/D'}<br>
      Tipo: ${item.tipo || 'N/D'}<br><br>

      <button onclick="editarEstado(${item.id}, '${(item.estado || '').replace(/'/g, "\\'")}')">
        Editar estado
      </button>

      <br><br>

      <button onclick="editarTipo(${item.id}, '${(item.tipo || '').replace(/'/g, "\\'")}')">
        Editar tipo
      </button>
    `;

    marker.bindPopup(popup);
    capaLuminarias.addLayer(marker);
    dibujados++;
  });

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;
}

// EDITAR ESTADO (igual)
async function editarEstado(id, estadoActual) {
  const nuevoEstado = prompt(`Estado actual: ${estadoActual}`, estadoActual);

  if (!nuevoEstado || nuevoEstado.trim() === '') return;

  const { error } = await supabaseClient
    .from('luminarias')
    .update({ estado: nuevoEstado.trim() })
    .eq('id', id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  await cargarLuminarias();
}

// 🔥 NUEVO: EDITAR TIPO
async function editarTipo(id, tipoActual) {
  const nuevoTipo = prompt(
    `Tipo actual: ${tipoActual}\n(led, mercurio, fluorescente):`,
    tipoActual
  );

  if (!nuevoTipo || nuevoTipo.trim() === '') return;

  const tipoNormalizado = nuevoTipo.toLowerCase().trim();

  const { error } = await supabaseClient
    .from('luminarias')
    .update({ tipo: tipoNormalizado })
    .eq('id', id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  await cargarLuminarias();
}

// INICIAR
async function iniciarMapa() {
  await cargarMunicipios();
  await cargarLuminarias();

  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);
}

window.editarEstado = editarEstado;
window.editarTipo = editarTipo;

iniciarMapa();