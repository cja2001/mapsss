const supabaseUrl = 'https://nwnlqaohxzxflmxwrtyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

const map = L.map('map', {
  preferCanvas: true
}).setView([13.692, -89.191], 10);

// CAPAS BASE
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
const satelital = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { maxZoom: 19 }
);

satelital.addTo(map);

const baseMaps = {
  "Mapa normal": osm,
  "Satelital": satelital
};

const overlays = {};

let capaLuminarias = null;
let controlCapas = null;

// 🎨 COLOR POR TIPO
function obtenerColorPorTipo(tipo) {
  const t = (tipo || '').toLowerCase().trim();

  if (t === 'led') return '#22c55e';
  if (t === 'mercurio') return '#3b82f6';
  if (t === 'fluorescente' || t === 'fluoresente') return '#a855f7';

  return '#6b7280';
}

// 📊 PANEL
const panelConteo = L.control({ position: 'topright' });

panelConteo.onAdd = function () {
  const div = L.DomUtil.create('div', 'panel-conteo');
  div.innerHTML = `
    <strong>Luminarias</strong><br>
    <span id="count-led">LED: 0</span><br>
    <span id="count-mercurio">Mercurio: 0</span><br>
    <span id="count-fluorescente">Fluorescente: 0</span>
  `;
  return div;
};

// 📊 ACTUALIZAR CONTEO (SIN CRASH)
function actualizarConteo(datos) {

  const elLed = document.getElementById('count-led');
  const elMercurio = document.getElementById('count-mercurio');
  const elFluorescente = document.getElementById('count-fluorescente');

  if (!elLed || !elMercurio || !elFluorescente) return;

  let led = 0;
  let mercurio = 0;
  let fluorescente = 0;

  datos.forEach(item => {
    const t = (item.tipo || '').toLowerCase().trim();

    if (t === 'led') led++;
    else if (t === 'mercurio') mercurio++;
    else if (t === 'fluorescente' || t === 'fluoresente') fluorescente++;
  });

  elLed.textContent = `LED: ${led}`;
  elMercurio.textContent = `Mercurio: ${mercurio}`;
  elFluorescente.textContent = `Fluorescente: ${fluorescente}`;
}

// 🚀 CARGAR DATOS
async function cargarLuminarias() {

  if (capaLuminarias) map.removeLayer(capaLuminarias);

  capaLuminarias = L.layerGroup();

  let todos = [];
  let desde = 0;
  const limite = 1000;
  let continuar = true;

  while (continuar) {
    const { data, error } = await supabaseClient
      .from('luminarias')
      .select('id, lat, lng, tipo')
      .range(desde, desde + limite - 1);

    if (error) throw error;

    if (!data || data.length === 0) break;

    todos = todos.concat(data);

    if (data.length < limite) {
      continuar = false;
    } else {
      desde += limite;
    }
  }

  console.log('Total registros:', todos.length);

  // 🔥 ACTUALIZA PANEL DESPUÉS DE EXISTIR
  actualizarConteo(todos);

  todos.forEach(item => {

    if (item.lat == null || item.lng == null) return;

    const color = obtenerColorPorTipo(item.tipo);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: 2.5,
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      weight: 0.5
    });

    marker.bindPopup(`
      <b>ID:</b> ${item.id}<br>
      <b>Tipo:</b> ${item.tipo || 'N/D'}<br><br>
      <button onclick="editarTipo(${item.id}, '${(item.tipo || '').replace(/'/g, "\\'")}')">
        Editar tipo
      </button>
    `);

    capaLuminarias.addLayer(marker);
  });

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;
}

// ✏️ EDITAR
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

// 📍 UBICACIÓN
function ubicarUsuario() {

  map.locate({ setView: true, maxZoom: 16 });

  map.on('locationfound', e => {

    L.circleMarker([e.latitude, e.longitude], {
      radius: 6,
      color: '#1d4ed8',
      fillColor: '#60a5fa',
      fillOpacity: 0.9
    }).addTo(map).bindPopup("Estás aquí");

  });
}

// 🚀 INIT
async function iniciarMapa() {

  panelConteo.addTo(map); // 🔥 PRIMERO EL PANEL

  await cargarLuminarias();

  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);

  ubicarUsuario();
}

window.editarTipo = editarTipo;

iniciarMapa();