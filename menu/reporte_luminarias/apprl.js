const supabaseUrl = 'https://TU-PROYECTO.supabase.co';
const supabaseAnonKey = 'TU_ANON_KEY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

const map = L.map('map').setView([13.692, -89.191], 10);

// Capas base
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

function obtenerColorPorEstado(estado) {
  const valor = (estado || '').toString().toLowerCase().trim();

  switch (valor) {
    case 'buena':
      return 'green';
    case 'danada':
    case 'dañada':
      return 'red';
    case 'mantenimiento':
      return 'yellow';
    default:
      return 'gray';
  }
}

async function cargarGeoJSON(url) {
  const response = await fetch(url);
  const texto = await response.text();

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`);
  }

  return JSON.parse(texto);
}

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

async function cargarMunicipios() {
  const datosMunicipios = await cargarGeoJSON('Distritos SSS.geojson');

  capaMunicipios = L.geoJSON(datosMunicipios, {
    style: function () {
      return {
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0
      };
    },
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
    }
  }).addTo(map);

  overlays["Límites municipales"] = capaMunicipios;
}

async function cargarLuminarias() {
  if (capaLuminarias) {
    map.removeLayer(capaLuminarias);
  }

  const { data, error } = await supabaseClient
    .from('luminarias')
    .select('id, potencia, lat, lng, estado, distrito, tipo, observacion');

  if (error) {
    throw error;
  }

  capaLuminarias = L.layerGroup();

  data.forEach(item => {
    if (item.lat == null || item.lng == null) return;

    const color = obtenerColorPorEstado(item.estado);

    const marker = L.circleMarker([item.lat, item.lng], {
      radius: 8,
      color: color,
      fillColor: color,
      fillOpacity: 0.85,
      weight: 1
    });

    let popup = `
      <strong>Luminaria ${item.id}</strong><br>
      Estado: ${item.estado || 'Sin estado'}<br>
      Potencia: ${item.potencia || 'N/D'}<br>
      Distrito: ${item.distrito || 'N/D'}<br>
      Tipo: ${item.tipo || 'N/D'}<br>
      Observación: ${item.observacion || 'N/D'}<br><br>
      <button onclick="editarEstado(${item.id}, '${item.estado || ''}')">Editar estado</button>
    `;

    marker.bindPopup(popup);
    capaLuminarias.addLayer(marker);
  });

  capaLuminarias.addTo(map);
  overlays["Luminarias"] = capaLuminarias;
}

async function editarEstado(id, estadoActual) {
  const nuevoEstado = prompt(
    `Estado actual: ${estadoActual}\nEscribe el nuevo estado:`,
    estadoActual
  );

  if (!nuevoEstado || nuevoEstado.trim() === '') return;

  const { error } = await supabaseClient
    .from('luminarias')
    .update({
      estado: nuevoEstado.trim(),
      fecha_actualizacion: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    alert('Error al actualizar: ' + error.message);
    return;
  }

  alert('Estado actualizado correctamente.');
  await cargarLuminarias();

  if (controlCapas) {
    map.removeControl(controlCapas);
  }

  controlCapas = L.control.layers(baseMaps, overlays, {
    collapsed: true
  }).addTo(map);
}

async function iniciarMapa() {
  try {
    await cargarMunicipios();
    await cargarLuminarias();

    controlCapas = L.control.layers(baseMaps, overlays, {
      collapsed: true
    }).addTo(map);

    const grupoGeneral = L.featureGroup();

    if (capaMunicipios) {
      capaMunicipios.eachLayer(layer => grupoGeneral.addLayer(layer));
    }

    if (capaLuminarias) {
      capaLuminarias.eachLayer(layer => grupoGeneral.addLayer(layer));
    }

    if (grupoGeneral.getLayers().length > 0) {
      map.fitBounds(grupoGeneral.getBounds(), { padding: [20, 20] });
    }
  } catch (error) {
    console.error(error);
    alert('Error al iniciar el mapa: ' + error.message);
  }
}

iniciarMapa();
window.editarEstado = editarEstado;