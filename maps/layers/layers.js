var wms_layers = [];


        var lyr_GoogleSatellite_0 = new ol.layer.Tile({
            'title': 'Google Satellite',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '&nbsp;&middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        });
var format_SAN_SALVADOR_SUR_1 = new ol.format.GeoJSON();
var features_SAN_SALVADOR_SUR_1 = format_SAN_SALVADOR_SUR_1.readFeatures(json_SAN_SALVADOR_SUR_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SAN_SALVADOR_SUR_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SAN_SALVADOR_SUR_1.addFeatures(features_SAN_SALVADOR_SUR_1);
var lyr_SAN_SALVADOR_SUR_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_SAN_SALVADOR_SUR_1, 
                style: style_SAN_SALVADOR_SUR_1,
                popuplayertitle: 'SAN_SALVADOR_SUR',
                interactive: true,
                title: '<img src="styles/legend/SAN_SALVADOR_SUR_1.png" /> SAN_SALVADOR_SUR'
            });

lyr_GoogleSatellite_0.setVisible(true);lyr_SAN_SALVADOR_SUR_1.setVisible(true);
var layersList = [lyr_GoogleSatellite_0,lyr_SAN_SALVADOR_SUR_1];
lyr_SAN_SALVADOR_SUR_1.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Descripci__n': 'Descripci__n', 'NOMBRE': 'NOMBRE', 'PPTO': 'PPTO', 'HABITANTES': 'HABITANTES', 'AT': 'AT', 'MUNICIPIO': 'MUNICIPIO', });
lyr_SAN_SALVADOR_SUR_1.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Descripci__n': 'TextEdit', 'NOMBRE': 'TextEdit', 'PPTO': 'TextEdit', 'HABITANTES': 'TextEdit', 'AT': 'TextEdit', 'MUNICIPIO': 'TextEdit', });
lyr_SAN_SALVADOR_SUR_1.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Descripci__n': 'no label', 'NOMBRE': 'inline label - always visible', 'PPTO': 'no label', 'HABITANTES': 'no label', 'AT': 'no label', 'MUNICIPIO': 'no label', });
lyr_SAN_SALVADOR_SUR_1.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});