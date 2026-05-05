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

satelital.addTo(map);

const baseMaps = {
  "Mapa normal": osm,
  "Satelital": satelital
};

const overlays = {};

let capaMunicipios = null;
let capaLuminarias = null;
let controlCapas = null;

// COLOR POR TIPO
function obtenerColorPorTipo(tipo) {
  const valor = (tipo || '').toString().toLowerCase().trim();

  switch (valor) {
    case 'led': return '#22c55e';
    case 'mercurio': return '#3b82f6';
    case 'fluorescente':
    case 'fluoresente': return '#a855f7';
    default: return '#6b7280';
  }
}

// GEOJSON
async function cargarGeoJSON(url) {
  const response = await fetch(url);
  const texto = await response.text();

  if (!response.ok) throw new Error(`No se pudo cargar ${url}`);

  return JSON.parse(texto);
}

// MUNICIPIOS
function obtenerNombreMunicipio(props) {
  return props.nombre || props.NOMBRE || props.municipio || props.MUNICIPIO || 'Municipio';
}

async function cargarMunicipios() {
  const datos = await cargarGeoJSON('Distritos SSS.geojson');

  capaMunicipios = L.geoJSON(datos, {
    style: () => ({
      color: '#ffffff',
      weight: 3,
      fillOpacity: 0
    }),
    onEachFeature: (feature, layer) => {
      const nombre = obtenerNombreMunicipio(feature.properties || {});
      layer.bindTooltip(nombre, { permanent: true, direction: 'center' });
    }
  }).addTo(map);

  overlays["Municipios"] = capaMunicipios;
}

// LUMINARIAS
async function cargarLuminarias() {

  if (capaLuminarias) map.removeLayer(capaLuminarias);

  capaLuminarias = L.layerGroup();

  const { data, error } = await supabaseClient
    .from('luminarias')
    .select('id, potencia, lat, lng, estado, distrito, tipo');

  if (error) throw error;

  data.forEach(item => {

    if (!item.lat || !item.lng) return;

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
      Tipo: ${item.tipo || 'N/D'}<br>
      Estado: ${item.estado || 'N/D'}<br><br>

      <button onclick="editarTipo(${item.id}, '${(item.tipo || '').replace(/'/g, "\\'")}')">
        Editar tipo
      </button>
    `;

    marker.bindPopup(popup);
    capaLuminarias.addLayer(marker);
  });

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;
}

// EDITAR TIPO
async function editarTipo(id, tipoActual) {

  const nuevoTipo = prompt(
    `Tipo actual: ${tipoActual}\n(led, mercurio, fluorescente):`,
    tipoActual
  );

  if (!nuevoTipo) return;

  const { error } = await supabaseClient
    .from('luminarias')
    .update({ tipo: nuevoTipo.toLowerCase().trim() })
    .eq('id', id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  await cargarLuminarias();
}

// UBICACIÓN DEL USUARIO
function ubicarUsuario() {

  map.locate({
    setView: true,
    maxZoom: 17
  });

  map.on('locationfound', function (e) {

    L.circleMarker([e.latitude, e.longitude], {
      radius: 7,
      color: '#1d4ed8',
      fillColor: '#60a5fa',
      fillOpacity: 0.8
    })
    .addTo(map)
    .bindPopup("Estás aquí")
    .openPopup();

    L.circle([e.latitude, e.longitude], {
      radius: e.accuracy,
      color: '#3b82f6',
      fillOpacity: 0.1
    }).addTo(map);

  });

  map.on('locationerror', function () {
    alert('No se pudo obtener tu ubicación');
  });
}

// INICIO
async function iniciarMapa() {
  await cargarMunicipios();
  await cargarLuminarias();

  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);

  ubicarUsuario();
}

window.editarTipo = editarTipo;

iniciarMapa();