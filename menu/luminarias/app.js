// ─── SUPABASE ─────────────────────────────
const supabase = window.supabase.createClient(
  'https://nwnlqaohxzxflmxwrtyy.supabase.co',
  'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr'
);

// ─── MAPA ─────────────────────────────
const map = L.map('map').setView([13.7, -89.2], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// ─── CAPA ─────────────────────────────
const capa = L.layerGroup().addTo(map);

// ─── FUNCIONES ─────────────────────────────
function normalizarTipo(tipo) {
  return tipo?.toLowerCase().trim().replace('fluoresente', 'fluorescente');
}

function getColor(tipo) {
  switch (tipo) {
    case 'led': return '#22c55e';
    case 'mercurio': return '#3b82f6';
    case 'fluorescente': return '#a855f7';
    default: return '#9ca3af';
  }
}

// ─── CARGAR DATOS ─────────────────────────────
async function cargarLuminarias() {

  capa.clearLayers();

  const { data, error } = await supabase
    .from('luminarias')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(l => {

    const tipo = normalizarTipo(l.tipo);

    const marker = L.circleMarker([l.lat, l.lng], {
      radius: 5,
      color: getColor(tipo),
      fillColor: getColor(tipo),
      fillOpacity: 0.4,
      weight: 1
    }).addTo(capa);

    marker.bindPopup(`
      <b>ID:</b> ${l.id}<br>
      <b>Tipo:</b> ${tipo}<br>
      <button onclick="editarTipo(${l.id})">Cambiar tipo</button>
    `);
  });
}

// ─── EDITAR TIPO ─────────────────────────────
window.editarTipo = async function(id) {

  const nuevoTipo = prompt("Nuevo tipo (led, mercurio, fluorescente):");

  if (!nuevoTipo) return;

  const tipoFinal = normalizarTipo(nuevoTipo);

  const { error } = await supabase
    .from('luminarias')
    .update({ tipo: tipoFinal })
    .eq('id', id);

  if (error) {
    alert("Error al actualizar");
    console.error(error);
    return;
  }

  alert("Actualizado correctamente");
  cargarLuminarias();
}

// ─── UBICACIÓN DEL USUARIO ─────────────────────────────
map.locate({ setView: true, maxZoom: 17 });

map.on('locationfound', function(e) {

  L.circleMarker([e.latitude, e.longitude], {
    radius: 7,
    color: '#1d4ed8',
    fillColor: '#60a5fa',
    fillOpacity: 0.8
  }).addTo(map)
  .bindPopup("Estás aquí");

});

map.on('locationerror', function() {
  console.log("No se pudo obtener ubicación");
});

// ─── LEYENDA ─────────────────────────────
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');

  const tipos = ['led', 'mercurio', 'fluorescente'];

  tipos.forEach(t => {
    div.innerHTML += `
      <div>
        <span style="background:${getColor(t)}"></span>
        ${t}
      </div>
    `;
  });

  return div;
};

legend.addTo(map);

// ─── INIT ─────────────────────────────
cargarLuminarias();