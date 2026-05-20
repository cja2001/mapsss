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

// ÍCONO ÚNICO PARA TODOS LOS PUNTOS
const iconoPunto = L.icon({
  iconUrl: 'img/planm.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// OBJETOS PARA EL CONTROL DE CAPAS
const baseMaps = {
  "Mapa normal": osm,
  "Satelital": satelital
};

const overlays = {};

let capaPuntos = null;
let capaMunicipios = null;

// FUNCIÓN GENERAL PARA CARGAR GEOJSON
async function cargarGeoJSON(url) {
  const response = await fetch(url);
  const texto = await response.text();

  console.log(`Respuesta de ${url}:`, texto);

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: no se pudo cargar ${url}`);
  }

  try {
    return JSON.parse(texto);
  } catch (e) {
    throw new Error(`El archivo ${url} no tiene un JSON válido.`);
  }
}

// FUNCIÓN PARA OBTENER EL NOMBRE DEL MUNICIPIO
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

// FUNCIÓN PRINCIPAL
async function iniciarMapa() {
  try {
    const [datosPuntos, datosMunicipios] = await Promise.all([
      cargarGeoJSON('Plan Mol 2026.geojson'),
      cargarGeoJSON('Distritos SSS.geojson')
    ]);

    if (!datosPuntos.features || !Array.isArray(datosPuntos.features)) {
      throw new Error('El archivo puntos.geojson no tiene estructura GeoJSON válida.');
    }

    if (!datosMunicipios.features || !Array.isArray(datosMunicipios.features)) {
      throw new Error('El archivo municipios.geojson no tiene estructura GeoJSON válida.');
    }

    // CAPA DE MUNICIPIOS
    capaMunicipios = L.geoJSON(datosMunicipios, {
      style: function () {
        return {
          color: '#ffffff',   // CAMBIO: borde blanco
          weight: 3,          // CAMBIO: grosor de línea
          opacity: 1,
          fillOpacity: 0      // CAMBIO: sin relleno
        };
      },

      onEachFeature: function (feature, layer) {
        const props = feature.properties || {};
        const nombreMunicipio = obtenerNombreMunicipio(props);

        // POPUP
        let contenido = `<strong>${nombreMunicipio}</strong>`;

        Object.keys(props).forEach(clave => {
          contenido += `<br>${clave}: ${props[clave]}`;
        });

        layer.bindPopup(contenido);

        // ETIQUETA VISIBLE SIEMPRE
        layer.bindTooltip(nombreMunicipio, {
          permanent: true,
          direction: 'center',
          className: 'etiqueta-municipio'
        });

        // EFECTO AL PASAR EL MOUSE
        layer.on({
          mouseover: function (e) {
            e.target.setStyle({
              weight: 4,
              color: '#ffffff'
            });
          },
          mouseout: function (e) {
            capaMunicipios.resetStyle(e.target);
          }
        });
      }
    }).addTo(map);

    // CAPA DE PUNTOS
    capaPuntos = L.geoJSON(datosPuntos, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: iconoPunto
        });
      },

      onEachFeature: function (feature, layer) {
        const props = feature.properties || {};
        let contenido = '<strong>Información del punto</strong>';

        Object.keys(props).forEach(clave => {
          contenido += `<br>${clave}: ${props[clave]}`;
        });

        layer.bindPopup(contenido);
      }
    }).addTo(map);

    // AGREGAR AL CONTROL DE CAPAS
    overlays["Límites municipales"] = capaMunicipios;
    overlays["Puntos"] = capaPuntos;

    // CONTROL DE CAPAS DESPLEGABLE TÍPICO DE LEAFLET
    L.control.layers(baseMaps, overlays, {
      collapsed: true
    }).addTo(map);

    // AJUSTAR EXTENSIÓN
    const grupoGeneral = L.featureGroup();

    if (capaMunicipios.getLayers().length > 0) {
      capaMunicipios.eachLayer(layer => grupoGeneral.addLayer(layer));
    }

    if (capaPuntos.getLayers().length > 0) {
      capaPuntos.eachLayer(layer => grupoGeneral.addLayer(layer));
    }

    if (grupoGeneral.getLayers().length > 0) {
      map.fitBounds(grupoGeneral.getBounds(), { padding: [20, 20] });
    }

  } catch (error) {
    console.error('Error al iniciar el mapa:', error);
    alert('Error al cargar las capas: ' + error.message);

    L.control.layers(baseMaps, overlays, {
      collapsed: true
    }).addTo(map);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const rol = await protegerPagina(['admin']);
  if (!rol) return;
  await iniciarMapa();
});