const supabaseUrl = 'https://nwnlqaohxzxflmxwrtyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 🔥 Canvas para rendimiento (basado en Censo)
const map = L.map('map', {
  preferCanvas: true,
  maxZoom: 24
}).setView([13.692, -89.191], 10);

// ─── Capas base ───────────────────────────────────────
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 24,
  maxNativeZoom: 19,
  attribution: '&copy; OpenStreetMap'
});

const satelital = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 24,
    maxNativeZoom: 19,
    attribution: 'Tiles © Esri'
  }
);

satelital.addTo(map);

const baseMaps = {
  "Mapa normal": osm,
  "Satelital": satelital
};

const overlays = {};
let capaLuminarias = null;
let controlCapas = null;

// ─── Color por estado ─────────────────────────────────
function obtenerColorPorEstado(estado) {
  const valor = (estado || '').toString().toLowerCase().trim();
  if (valor === 'buena') return '#22c55e'; // Verde
  if (valor === 'danada' || valor === 'dañada') return '#ef4444'; // Rojo
  if (valor === 'mantenimiento') return '#eab308'; // Amarillo
  return '#6b7280'; // Gris
}

// ─── Panel de estadísticas ────────────────────────────
const ESTADOS_CONFIG = [
  { key: 'buenas', label: 'Buenas', color: '#22c55e' },
  { key: 'danadas', label: 'Dañadas', color: '#ef4444' },
  { key: 'proceso', label: 'En proceso', color: '#eab308' },
  { key: 'otro', label: 'Otro / N/D', color: '#6b7280' },
];

function actualizarEstadisticas(datos) {
  const conteos = { buenas: 0, danadas: 0, proceso: 0, otro: 0 };

  datos.forEach(item => {
    const valorEstado = (item.estado || '').toString().toLowerCase().trim();
    if (valorEstado === 'buena') conteos.buenas++;
    else if (valorEstado === 'danada' || valorEstado === 'dañada') conteos.danadas++;
    else if (valorEstado === 'mantenimiento') conteos.proceso++;
    else conteos.otro++;
  });

  const total = datos.length;

  // Total
  const statTotal = document.getElementById('stat-total');
  if(statTotal) statTotal.textContent = total.toLocaleString('es-SV');

  // Filas por estado
  const tiposHTML = ESTADOS_CONFIG.map(({ key, label, color }) => {
    const n = conteos[key];
    const pct = total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';
    return `
      <div class="stat-tipo-row">
        <span class="stat-tipo-nombre">
          <span class="stat-tipo-dot" style="background:${color}"></span>
          ${label}
        </span>
        <span class="stat-tipo-valores">
          <span class="stat-tipo-count">${n.toLocaleString('es-SV')}</span>
          <span class="stat-tipo-pct">${pct}%</span>
        </span>
      </div>`;
  }).join('');

  const statTipos = document.getElementById('stat-tipos');
  if(statTipos) statTipos.innerHTML = tiposHTML;

  // Barra de distribución
  const barraHTML = ESTADOS_CONFIG
    .filter(({ key }) => conteos[key] > 0)
    .map(({ key, color }) => {
      const pct = ((conteos[key] / total) * 100).toFixed(2);
      return `<div class="stat-barra-seg" style="width:${pct}%;background:${color}"></div>`;
    }).join('');

  const statBarra = document.getElementById('stat-barra');
  if(statBarra) statBarra.innerHTML = barraHTML;
}

// ─── Toggle minimizar panel ───────────────────────────
function togglePanel() {
  const body = document.getElementById('panel-body');
  const btn = document.querySelector('.panel-toggle');
  if (!body || !btn) return;
  const oculto = body.style.display === 'none';
  body.style.display = oculto ? '' : 'none';
  btn.textContent = oculto ? '−' : '+';
}

// ─── Radio dinámico por zoom ──────────────────────────
function obtenerRadioZoom() {
  const z = map.getZoom();
  if (z >= 23) return 14;
  if (z >= 21) return 10;
  if (z >= 19) return 7;
  if (z >= 17) return 4.5;
  if (z >= 15) return 3;
  if (z >= 13) return 2;
  return 1.2;
}

map.on('zoomend', () => {
  if (capaLuminarias) {
    const nuevoRadio = obtenerRadioZoom();
    capaLuminarias.eachLayer(layer => {
      if (layer.setRadius) {
        layer.setRadius(nuevoRadio);
      }
    });
  }
});

// ─── Cargar luminarias (paginado) ─────────────────────
async function cargarLuminarias() {
  if (capaLuminarias) map.removeLayer(capaLuminarias);
  capaLuminarias = L.layerGroup();

  // Mostrar estado de carga en el panel
  const statTotal = document.getElementById('stat-total');
  const statTipos = document.getElementById('stat-tipos');
  const statBarra = document.getElementById('stat-barra');

  if(statTotal) statTotal.textContent = '…';
  if(statTipos) statTipos.innerHTML = '<p class="stat-loading">Cargando datos…</p>';
  if(statBarra) statBarra.innerHTML = '';

  let todos = [];
  let desde = 0;
  const limite = 1000;
  let continuar = true;

  try {
    while (continuar) {
      const { data, error } = await supabaseClient
        .from('luminarias')
        .select('id, lat, lng, tipo, potencia, estado, distrito')
        .range(desde, desde + limite - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      todos = todos.concat(data);
      continuar = data.length === limite;
      desde += limite;
    }
  } catch (err) {
    console.error("Error cargando de Supabase:", err);
    alert("Error cargando datos: " + err.message);
    if(statTipos) statTipos.innerHTML = `<p class="stat-loading" style="color:red">Error: ${err.message}</p>`;
    return;
  }

  console.log('Total registros:', todos.length);

  let dibujados = 0;

  todos.forEach(item => {
    if (item.lat == null || item.lng == null) return;

    const color = obtenerColorPorEstado(item.estado);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: obtenerRadioZoom(),
      color: color,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 1
    });

    const popup = `
      <strong>Luminaria ${item.id}</strong><br>
      Potencia: ${item.potencia || 'N/D'}<br>
      Estado: ${item.estado || 'N/D'}<br>
      Distrito: ${item.distrito || 'N/D'}<br>
      Tipo: ${item.tipo || 'N/D'}<br>
      Lat: ${item.lat}<br>
      Lng: ${item.lng}<br><br>
      <button onclick="editarEstado(${item.id}, '${(item.estado || '').replace(/'/g, "\\'")}')">
        Editar estado
      </button>
    `;

    marker.bindPopup(popup);
    capaLuminarias.addLayer(marker);
    dibujados++;
  });

  console.log('Puntos dibujados:', dibujados);

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;

  // Actualizar panel con los datos cargados
  actualizarEstadisticas(todos);
}

// ─── Editar estado ────────────────────────────────────
async function editarEstado(id, estadoActual) {
  const nuevoEstado = prompt(
    `Estado actual: ${estadoActual}\nEscribe el nuevo estado (buena, dañada, mantenimiento):`,
    estadoActual
  );

  if (!nuevoEstado || nuevoEstado.trim() === '') return;

  const { error } = await supabaseClient
    .from('luminarias')
    .update({ estado: nuevoEstado.trim() })
    .eq('id', id);

  if (error) {
    alert('Error al actualizar: ' + error.message);
    return;
  }

  await cargarLuminarias();
  
  // Re-asignar controles para no perderlos
  if (controlCapas) {
    map.removeControl(controlCapas);
  }
  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);
}

// ─── Ubicación del usuario ────────────────────────────
let userMarker = null;

function ubicarUsuario() {
  const controlUbicacion = L.control({ position: 'topleft' });
  controlUbicacion.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const btn = L.DomUtil.create('a', '', div);
    btn.innerHTML = '📍';
    btn.href = '#';
    btn.title = 'Centrar en mi ubicación';
    btn.style.fontSize = '16px';
    btn.style.lineHeight = '30px';
    btn.style.textAlign = 'center';
    btn.style.textDecoration = 'none';
    btn.style.cursor = 'pointer';

    L.DomEvent.on(btn, 'click', function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 16 });
    });

    return div;
  };
  controlUbicacion.addTo(map);

  map.on('locationfound', e => {
    if (userMarker) {
      map.removeLayer(userMarker);
    }
    userMarker = L.circleMarker([e.latitude, e.longitude], {
      radius: 6,
      color: '#1d4ed8',
      fillColor: '#60a5fa',
      fillOpacity: 0.9
    }).addTo(map).bindPopup("Estás a aprox. " + Math.round(e.accuracy/2) + " metros de este punto").openPopup();
  });

  map.on('locationerror', e => {
    alert("No se pudo obtener tu ubicación: " + e.message);
  });
}

// ─── Cargar GeoJSON ───────────────────────────────────
let geojsonLayerGlobal = null;

async function cargarGeoJSON() {
  const fileName = 'Distritos SSS.geojson';
  try {
    const response = await fetch(encodeURI(fileName));
    if (!response.ok) throw new Error("No se encontró el archivo");
    const data = await response.json();

    const isSatelital = map.hasLayer(satelital);
    const initialColor = isSatelital ? 'white' : '#1e3a8a';

    const geojsonLayer = L.geoJSON(data, {
      interactive: false,
      style: {
        color: initialColor,
        weight: 2,
        opacity: 0.8,
        fill: false
      },
      onEachFeature: function (feature, layer) {
        layer.options.interactive = false;
      }
    }).addTo(map);

    geojsonLayerGlobal = geojsonLayer;
    overlays[fileName] = geojsonLayer;

    // Mostrar nombre en el panel
    const infoDiv = document.getElementById('geojson-info');
    if (infoDiv) {
      const gName = document.getElementById('geojson-name');
      if (gName) gName.textContent = fileName;
      infoDiv.style.display = 'block';
    }
  } catch (err) {
    console.error("Error al cargar GeoJSON:", err);
  }
}

// ─── Añadir luminaria con botón ───────────────────────
let modoAñadirActivo = false;

function activarModoAñadir() {
  const btn = document.getElementById('btn-add');
  if (modoAñadirActivo) {
    modoAñadirActivo = false;
    btn.textContent = '➕ Añadir Luminaria';
    btn.classList.remove('active');
    document.getElementById('map').style.cursor = '';
    map.off('click', onMapClickAñadir);
    return;
  }
  modoAñadirActivo = true;
  btn.textContent = 'Cancelar (Haz clic en el mapa)';
  btn.classList.add('active');
  document.getElementById('map').style.cursor = 'crosshair';
  map.once('click', onMapClickAñadir);
}

async function onMapClickAñadir(e) {
  const { lat, lng } = e.latlng;

  modoAñadirActivo = false;
  const btn = document.getElementById('btn-add');
  if (btn) {
    btn.textContent = '➕ Añadir Luminaria';
    btn.classList.remove('active');
  }
  document.getElementById('map').style.cursor = '';

  const formHtml = `
    <div style="min-width: 150px; font-family: sans-serif;">
      <h4 style="margin: 0 0 10px 0; font-size: 14px;">Nueva Luminaria</h4>
      
      <label style="display:block; font-size:12px; margin-bottom:4px;">Estado:</label>
      <select id="add-estado" style="width: 100%; margin-bottom: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
        <option value="buena">Buena</option>
        <option value="dañada">Dañada</option>
        <option value="mantenimiento">En Mantenimiento</option>
      </select>

      <label style="display:block; font-size:12px; margin-bottom:4px;">Potencia (ej: 100W):</label>
      <input type="text" id="add-potencia" placeholder="100W" style="width: 100%; margin-bottom: 15px; padding: 5px; border-radius: 4px; border: 1px solid #ccc; box-sizing: border-box;">

      <button onclick="guardarNuevaLuminaria(${lat}, ${lng})" style="width: 100%; background: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Guardar
      </button>
    </div>
  `;

  L.popup()
    .setLatLng([lat, lng])
    .setContent(formHtml)
    .openOn(map);
}

window.guardarNuevaLuminaria = async function (lat, lng) {
  const estado = document.getElementById('add-estado').value;
  const potencia = document.getElementById('add-potencia').value;

  if (!potencia.trim()) {
    alert("Por favor ingresa la potencia.");
    return;
  }

  const { error } = await supabaseClient
    .from('luminarias')
    .insert([{ lat, lng, estado: estado.toLowerCase().trim(), potencia: potencia.trim() }]);

  if (error) {
    alert('Error al añadir: ' + error.message);
  } else {
    map.closePopup();
    await cargarLuminarias();
  }
};

// ─── Init ─────────────────────────────────────────────
async function iniciarMapa() {
  await cargarGeoJSON();
  await cargarLuminarias();
  
  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);
  ubicarUsuario();

  map.on('baselayerchange', function (e) {
    if (geojsonLayerGlobal) {
      if (e.name === 'Satelital') {
        geojsonLayerGlobal.setStyle({ color: 'white' });
      } else {
        geojsonLayerGlobal.setStyle({ color: '#1e3a8a' });
      }
    }
  });
}

window.editarEstado = editarEstado;
window.togglePanel = togglePanel;
window.activarModoAñadir = activarModoAñadir;

iniciarMapa();