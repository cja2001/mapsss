/*
 Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 https://github.com/Leaflet/Leaflet.markercluster
 (c) 2012-2013, Dave Leaver, smartrak
*/
// Crear mapa
var map = L.map('map', {
    zoomControl: true
}).setView([13.70, -89.18], 12);

// Mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Popup
function pop_puntos(feature, layer) {
    var contenido = '';

    if (feature.properties) {
        if (feature.properties.nombre) {
            contenido += '<b>Nombre:</b> ' + feature.properties.nombre;
        }
    }

    if (contenido !== '') {
        layer.bindPopup(contenido);
    }
}

// Grupo de clúster
var cluster_puntos = L.markerClusterGroup({
    disableClusteringAtZoom: 16,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});

// Capa GeoJSON
var layer_puntos = L.geoJSON(json_puntos, {
    onEachFeature: pop_puntos,
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng);
    }
});

// Agregar la capa al cluster
cluster_puntos.addLayer(layer_puntos);

// Agregar el cluster al mapa
map.addLayer(cluster_puntos);