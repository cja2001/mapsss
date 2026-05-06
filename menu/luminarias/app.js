const supabaseUrl = 'https://nwnlqaohxzxflmxwrtyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// 🔥 Canvas para rendimiento
const map = L.map('map', {
  preferCanvas: true,
  maxZoom: 24
}).setView([13.692, -89.191], 10);

// ─── Capas base ───────────────────────────────────────
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 24,
  maxNativeZoom: 19
});

const satelital = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 24,
    maxNativeZoom: 19
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

// ─── Color por tipo ───────────────────────────────────
function obtenerColorPorTipo(tipo) {
  const t = (tipo || '').toLowerCase().trim();
  if (t === 'led') return '#22c55e';
  if (t === 'mercurio') return '#3b82f6';
  if (t === 'fluorescente' || t === 'fluoresente') return '#a855f7';
  return '#6b7280';
}

// ─── Panel de estadísticas ────────────────────────────
const TIPOS_CONFIG = [
  { key: 'led', label: 'LED', color: '#22c55e' },
  { key: 'mercurio', label: 'Mercurio', color: '#3b82f6' },
  { key: 'fluorescente', label: 'Fluorescente', color: '#a855f7' },
  { key: 'otro', label: 'Otro / N/D', color: '#6b7280' },
];

function actualizarEstadisticas(datos) {
  const conteos = { led: 0, mercurio: 0, fluorescente: 0, otro: 0 };

  datos.forEach(item => {
    const t = (item.tipo || '').toLowerCase().trim();
    if (t === 'led') conteos.led++;
    else if (t === 'mercurio') conteos.mercurio++;
    else if (t === 'fluorescente' || t === 'fluoresente') conteos.fluorescente++;
    else conteos.otro++;
  });

  const total = datos.length;

  // Total
  document.getElementById('stat-total').textContent = total.toLocaleString('es-SV');

  // Filas por tipo
  const tiposHTML = TIPOS_CONFIG.map(({ key, label, color }) => {
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

  document.getElementById('stat-tipos').innerHTML = tiposHTML;

  // Barra de distribución
  const barraHTML = TIPOS_CONFIG
    .filter(({ key }) => conteos[key] > 0)
    .map(({ key, color }) => {
      const pct = ((conteos[key] / total) * 100).toFixed(2);
      return `<div class="stat-barra-seg" style="width:${pct}%;background:${color}"></div>`;
    }).join('');

  document.getElementById('stat-barra').innerHTML = barraHTML;
}

// ─── Toggle minimizar panel ───────────────────────────
function togglePanel() {
  const body = document.getElementById('panel-body');
  const btn = document.querySelector('.panel-toggle');
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
  document.getElementById('stat-total').textContent = '…';
  document.getElementById('stat-tipos').innerHTML =
    '<p class="stat-loading">Cargando datos…</p>';
  document.getElementById('stat-barra').innerHTML = '';

  let todos = [];
  let desde = 0;
  const limite = 1000;
  let continuar = true;

  try {
    while (continuar) {
      const { data, error } = await supabaseClient
        .from('luminarias')
        .select('id, lat, lng, tipo, potencia')
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
    document.getElementById('stat-tipos').innerHTML = `<p class="stat-loading" style="color:red">Error: ${err.message}</p>`;
    return;
  }

  console.log('Total registros:', todos.length);

  let dibujados = 0;

  todos.forEach(item => {
    if (item.lat == null || item.lng == null) return;

    const color = obtenerColorPorTipo(item.tipo);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: obtenerRadioZoom(),
      color: color,
      fillColor: color,
      fillOpacity: 0.5,
      weight: 0.5
    });

    marker.bindPopup(`
      <b>ID:</b> ${item.id}<br>
      <b>Tipo:</b> ${item.tipo || 'N/D'}<br>
      <b>Potencia:</b> ${item.potencia || 'N/D'}<br><br>
      <button onclick="editarTipo(${item.id}, '${(item.tipo || '').replace(/'/g, "\\'")}')">
        Editar tipo
      </button>
    `);

    capaLuminarias.addLayer(marker);
    dibujados++;
  });

  console.log('Puntos dibujados:', dibujados);
  if (todos.length > 0 && dibujados === 0) {
    alert("Se encontraron " + todos.length + " luminarias, pero ninguna se dibujó. Verifica que las columnas en Supabase sean 'lat' y 'lng' (en minúsculas).");
  }

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;

  // Actualizar panel con los datos cargados
  actualizarEstadisticas(todos);
}

// ─── Editar tipo ──────────────────────────────────────
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

// ─── Ubicación del usuario ────────────────────────────
let userMarker = null;

function ubicarUsuario() {
  // Añadir un botón en la interfaz de Leaflet
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

  // Ubicación inicial
  map.locate({ setView: true, maxZoom: 16 });

  map.on('locationfound', e => {
    if (userMarker) {
      map.removeLayer(userMarker);
    }
    userMarker = L.circleMarker([e.latitude, e.longitude], {
      radius: 6,
      color: '#1d4ed8',
      fillColor: '#60a5fa',
      fillOpacity: 0.9
    }).addTo(map).bindPopup("Estás aquí");
  });

  map.on('locationerror', () => {
    console.log('No se pudo obtener ubicación');
  });
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
      
      <label style="display:block; font-size:12px; margin-bottom:4px;">Tipo:</label>
      <select id="add-tipo" style="width: 100%; margin-bottom: 10px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
        <option value="led">LED</option>
        <option value="mercurio">Mercurio</option>
        <option value="fluorescente">Fluorescente</option>
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
  const tipo = document.getElementById('add-tipo').value;
  const potencia = document.getElementById('add-potencia').value;

  if (!potencia.trim()) {
    alert("Por favor ingresa la potencia.");
    return;
  }

  const { error } = await supabaseClient
    .from('luminarias')
    .insert([{ lat, lng, tipo: tipo.toLowerCase().trim(), potencia: potencia.trim() }]);

  if (error) {
    alert('Error al añadir: ' + error.message);
  } else {
    map.closePopup();
    await cargarLuminarias();
  }
};

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
      style: {
        color: initialColor,
        weight: 2,
        opacity: 0.8,
        fill: false
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.NOMBRE) {
          layer.bindTooltip(feature.properties.NOMBRE, {
            permanent: true,
            direction: 'center',
            className: 'distrito-label'
          });
        }
      }
    }).addTo(map);

    geojsonLayerGlobal = geojsonLayer;
    overlays[fileName] = geojsonLayer;

    // Mostrar nombre en el panel
    const infoDiv = document.getElementById('geojson-info');
    if (infoDiv) {
      document.getElementById('geojson-name').textContent = fileName;
      infoDiv.style.display = 'block';
    }
  } catch (err) {
    console.error("Error al cargar GeoJSON:", err);
  }
}

// ─── Init ─────────────────────────────────────────────
async function iniciarMapa() {
  await cargarLuminarias();
  await cargarGeoJSON();
  controlCapas = L.control.layers(baseMaps, overlays).addTo(map);
  ubicarUsuario();

  map.on('baselayerchange', function (e) {
    if (geojsonLayerGlobal) {
      if (e.name === 'Satelital') {
        geojsonLayerGlobal.setStyle({ color: 'white' });
      } else {
        geojsonLayerGlobal.setStyle({ color: '#1e3a8a' }); // Azul marino
      }
    }
  });
}

window.editarTipo = editarTipo;
window.togglePanel = togglePanel;
window.activarModoAñadir = activarModoAñadir;

iniciarMapa();