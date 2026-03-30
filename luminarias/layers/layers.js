var wms_layers = [];


        var lyr_GoogleLabels_0 = new ol.layer.Tile({
            'title': 'Google Labels',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '&nbsp;&middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}'
            })
        });

        var lyr_GoogleSatellite_1 = new ol.layer.Tile({
            'title': 'Google Satellite',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '&nbsp;&middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        });
var format_SAN_SALVADOR_SUR_2 = new ol.format.GeoJSON();
var features_SAN_SALVADOR_SUR_2 = format_SAN_SALVADOR_SUR_2.readFeatures(json_SAN_SALVADOR_SUR_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SAN_SALVADOR_SUR_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SAN_SALVADOR_SUR_2.addFeatures(features_SAN_SALVADOR_SUR_2);
var lyr_SAN_SALVADOR_SUR_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_SAN_SALVADOR_SUR_2, 
                style: style_SAN_SALVADOR_SUR_2,
                popuplayertitle: 'SAN_SALVADOR_SUR',
                interactive: true,
                title: '<img src="styles/legend/SAN_SALVADOR_SUR_2.png" /> SAN_SALVADOR_SUR'
            });
var format_APGPSSANTOTOMAS2025_1xlsx_3 = new ol.format.GeoJSON();
var features_APGPSSANTOTOMAS2025_1xlsx_3 = format_APGPSSANTOTOMAS2025_1xlsx_3.readFeatures(json_APGPSSANTOTOMAS2025_1xlsx_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_APGPSSANTOTOMAS2025_1xlsx_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_APGPSSANTOTOMAS2025_1xlsx_3.addFeatures(features_APGPSSANTOTOMAS2025_1xlsx_3);
var lyr_APGPSSANTOTOMAS2025_1xlsx_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_APGPSSANTOTOMAS2025_1xlsx_3, 
                style: style_APGPSSANTOTOMAS2025_1xlsx_3,
                popuplayertitle: 'AP GPS SANTO TOMAS 2025_1.xlsx',
                interactive: true,
                title: '<img src="styles/legend/APGPSSANTOTOMAS2025_1xlsx_3.png" /> AP GPS SANTO TOMAS 2025_1.xlsx'
            });
var format_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4 = new ol.format.GeoJSON();
var features_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4 = format_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.readFeatures(json_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.addFeatures(features_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4);
var lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4, 
                style: style_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4,
                popuplayertitle: 'AP GPS SANTIAGO TEXACUANGOS 2025 — AP GPS SANTIAGO TEXACUANGOS_2025.xlsx',
                interactive: true,
                title: '<img src="styles/legend/APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.png" /> AP GPS SANTIAGO TEXACUANGOS 2025 — AP GPS SANTIAGO TEXACUANGOS_2025.xlsx'
            });
var format_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5 = new ol.format.GeoJSON();
var features_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5 = format_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.readFeatures(json_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.addFeatures(features_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5);
var lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5, 
                style: style_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5,
                popuplayertitle: 'GPS AP PANCHIMALCO 2025 — AP GPS PANCHIMALCO 2025_2.xlsx',
                interactive: true,
                title: '<img src="styles/legend/GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.png" /> GPS AP PANCHIMALCO 2025 — AP GPS PANCHIMALCO 2025_2.xlsx'
            });
var format_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6 = new ol.format.GeoJSON();
var features_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6 = format_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.readFeatures(json_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.addFeatures(features_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6);
var lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6, 
                style: style_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6,
                popuplayertitle: 'GPS AP PANCHIMALCO 2025 — AP GPS PANCHIMALCO 2025_1.xlsx',
                interactive: true,
                title: '<img src="styles/legend/GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.png" /> GPS AP PANCHIMALCO 2025 — AP GPS PANCHIMALCO 2025_1.xlsx'
            });
var format_LUMINARIASPANCHIMALCO_7 = new ol.format.GeoJSON();
var features_LUMINARIASPANCHIMALCO_7 = format_LUMINARIASPANCHIMALCO_7.readFeatures(json_LUMINARIASPANCHIMALCO_7, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_LUMINARIASPANCHIMALCO_7 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_LUMINARIASPANCHIMALCO_7.addFeatures(features_LUMINARIASPANCHIMALCO_7);
var lyr_LUMINARIASPANCHIMALCO_7 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_LUMINARIASPANCHIMALCO_7, 
                style: style_LUMINARIASPANCHIMALCO_7,
                popuplayertitle: 'LUMINARIAS PANCHIMALCO',
                interactive: true,
                title: '<img src="styles/legend/LUMINARIASPANCHIMALCO_7.png" /> LUMINARIAS PANCHIMALCO'
            });
var format_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8 = new ol.format.GeoJSON();
var features_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8 = format_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.readFeatures(json_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.addFeatures(features_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8);
var lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8, 
                style: style_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8,
                popuplayertitle: 'GPS ROSARIO DE MORA 2025 — AP GPS ROSARIO DE MORA 2025_1.xlsx',
                interactive: true,
    title: 'GPS ROSARIO DE MORA 2025 — AP GPS ROSARIO DE MORA 2025_1.xlsx<br />\
    <img src="styles/legend/GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8_0.png" /> lED<br />\
    <img src="styles/legend/GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8_1.png" /> Led<br />\
    <img src="styles/legend/GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8_2.png" /> LED<br />\
    <img src="styles/legend/GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8_3.png" /> LF<br />\
    <img src="styles/legend/GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8_4.png" /> <br />' });
var format_LUMINARIASSANMARCOSDS_9 = new ol.format.GeoJSON();
var features_LUMINARIASSANMARCOSDS_9 = format_LUMINARIASSANMARCOSDS_9.readFeatures(json_LUMINARIASSANMARCOSDS_9, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_LUMINARIASSANMARCOSDS_9 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_LUMINARIASSANMARCOSDS_9.addFeatures(features_LUMINARIASSANMARCOSDS_9);
var lyr_LUMINARIASSANMARCOSDS_9 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_LUMINARIASSANMARCOSDS_9, 
                style: style_LUMINARIASSANMARCOSDS_9,
                popuplayertitle: 'LUMINARIAS SAN MARCOS DS',
                interactive: true,
    title: 'LUMINARIAS SAN MARCOS DS<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_0.png" /> HALURO<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_1.png" /> Led<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_2.png" /> LF<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_3.png" /> LM<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_4.png" /> LS<br />\
    <img src="styles/legend/LUMINARIASSANMARCOSDS_9_5.png" /> <br />' });
var group_LuminariasSanMarcos = new ol.layer.Group({
                                layers: [lyr_LUMINARIASSANMARCOSDS_9,],
                                fold: 'close',
                                title: 'Luminarias San Marcos'});
var group_LuminariasRosariodeMora = new ol.layer.Group({
                                layers: [lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8,],
                                fold: 'close',
                                title: 'Luminarias Rosario de Mora'});
var group_LuminariasPanchimalco = new ol.layer.Group({
                                layers: [lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5,lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6,lyr_LUMINARIASPANCHIMALCO_7,],
                                fold: 'close',
                                title: 'Luminarias Panchimalco'});
var group_LuminariasSantiagoTexacuangos = new ol.layer.Group({
                                layers: [lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4,],
                                fold: 'close',
                                title: 'Luminarias Santiago Texacuangos'});
var group_TracksSantoTomas = new ol.layer.Group({
                                layers: [lyr_APGPSSANTOTOMAS2025_1xlsx_3,],
                                fold: 'close',
                                title: 'Tracks Santo Tomas'});
var group_Luminariaspordistritos = new ol.layer.Group({
                                layers: [],
                                fold: 'close',
                                title: 'Luminarias por distritos'});
var group_1proyectoluminariasSSS = new ol.layer.Group({
                                layers: [],
                                fold: 'close',
                                title: '1º proyecto luminarias SSS'});

lyr_GoogleLabels_0.setVisible(true);lyr_GoogleSatellite_1.setVisible(true);lyr_SAN_SALVADOR_SUR_2.setVisible(true);lyr_APGPSSANTOTOMAS2025_1xlsx_3.setVisible(true);lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.setVisible(true);lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.setVisible(true);lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.setVisible(true);lyr_LUMINARIASPANCHIMALCO_7.setVisible(true);lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.setVisible(true);lyr_LUMINARIASSANMARCOSDS_9.setVisible(true);
var layersList = [lyr_GoogleLabels_0,lyr_GoogleSatellite_1,lyr_SAN_SALVADOR_SUR_2,group_TracksSantoTomas,group_LuminariasSantiagoTexacuangos,group_LuminariasPanchimalco,group_LuminariasRosariodeMora,group_LuminariasSanMarcos];
lyr_SAN_SALVADOR_SUR_2.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Descripci__n': 'Descripci__n', 'NOMBRE': 'NOMBRE', 'PPTO': 'PPTO', 'HABITANTES': 'HABITANTES', 'AT': 'AT', 'MUNICIPIO': 'MUNICIPIO', });
lyr_APGPSSANTOTOMAS2025_1xlsx_3.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Potencia_W_': 'Potencia_W_', 'Distrito': 'Distrito', 'Latitude': 'Latitude', 'Longitude': 'Longitude', });
lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Distrito_': 'Distrito_', 'Tipo_': 'Tipo_', 'Potencia_W_': 'Potencia_W_', 'Latitude': 'Latitude', 'Longitude': 'Longitude', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Potencia_W_': 'Potencia_W_', 'Cliente_Municipio': 'Cliente_Municipio', 'Latitude': 'Latitude', 'Longitude': 'Longitude', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Potencia_W_': 'Potencia_W_', 'Cliente_Municipio': 'Cliente_Municipio', 'Latitude': 'Latitude', 'Longitude': 'Longitude', });
lyr_LUMINARIASPANCHIMALCO_7.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Potencia_W_': 'Potencia_W_', 'Cliente_Municipio': 'Cliente_Municipio', 'Latitude': 'Latitude', 'Longitude': 'Longitude', 'layer': 'layer', 'path': 'path', });
lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Tipo': 'Tipo', 'Potencia': 'Potencia', 'Latitude': 'Latitude', 'Longitude': 'Longitude', });
lyr_LUMINARIASSANMARCOSDS_9.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Folder_name': 'Folder_name', 'Tipo_': 'Tipo_', 'Potencia_': 'Potencia_', 'Latitude': 'Latitude', 'Longitude': 'Longitude', 'layer': 'layer', 'path': 'path', });
lyr_SAN_SALVADOR_SUR_2.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Descripci__n': 'TextEdit', 'NOMBRE': 'TextEdit', 'PPTO': 'TextEdit', 'HABITANTES': 'TextEdit', 'AT': 'TextEdit', 'MUNICIPIO': 'TextEdit', });
lyr_APGPSSANTOTOMAS2025_1xlsx_3.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Potencia_W_': 'TextEdit', 'Distrito': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', });
lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Distrito_': 'TextEdit', 'Tipo_': 'TextEdit', 'Potencia_W_': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Potencia_W_': 'TextEdit', 'Cliente_Municipio': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Potencia_W_': 'TextEdit', 'Cliente_Municipio': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', });
lyr_LUMINARIASPANCHIMALCO_7.set('fieldImages', {'id': '', 'Name': '', 'description': '', 'timestamp': '', 'begin': '', 'end': '', 'altitudeMode': '', 'tessellate': '', 'extrude': '', 'visibility': '', 'drawOrder': '', 'icon': '', 'Potencia_W_': '', 'Cliente_Municipio': '', 'Latitude': '', 'Longitude': '', 'layer': '', 'path': '', });
lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Tipo': 'TextEdit', 'Potencia': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', });
lyr_LUMINARIASSANMARCOSDS_9.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Folder_name': 'TextEdit', 'Tipo_': 'TextEdit', 'Potencia_': 'TextEdit', 'Latitude': 'TextEdit', 'Longitude': 'TextEdit', 'layer': 'TextEdit', 'path': 'TextEdit', });
lyr_SAN_SALVADOR_SUR_2.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Descripci__n': 'no label', 'NOMBRE': 'no label', 'PPTO': 'no label', 'HABITANTES': 'no label', 'AT': 'no label', 'MUNICIPIO': 'no label', });
lyr_APGPSSANTOTOMAS2025_1xlsx_3.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Potencia_W_': 'no label', 'Distrito': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', });
lyr_APGPSSANTIAGOTEXACUANGOS2025APGPSSANTIAGOTEXACUANGOS_2025xlsx_4.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Distrito_': 'no label', 'Tipo_': 'no label', 'Potencia_W_': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_2xlsx_5.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Potencia_W_': 'no label', 'Cliente_Municipio': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', });
lyr_GPSAPPANCHIMALCO2025APGPSPANCHIMALCO2025_1xlsx_6.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Potencia_W_': 'no label', 'Cliente_Municipio': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', });
lyr_LUMINARIASPANCHIMALCO_7.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Potencia_W_': 'no label', 'Cliente_Municipio': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', 'layer': 'no label', 'path': 'no label', });
lyr_GPSROSARIODEMORA2025APGPSROSARIODEMORA2025_1xlsx_8.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Tipo': 'no label', 'Potencia': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', });
lyr_LUMINARIASSANMARCOSDS_9.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Folder_name': 'no label', 'Tipo_': 'no label', 'Potencia_': 'no label', 'Latitude': 'no label', 'Longitude': 'no label', 'layer': 'no label', 'path': 'no label', });
lyr_LUMINARIASSANMARCOSDS_9.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});