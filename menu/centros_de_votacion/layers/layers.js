var wms_layers = [];


        var lyr_GoogleSatellite_0 = new ol.layer.Tile({
            'title': 'Google Satellite',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: '<a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        });
var format_CantonesyareasurbanasSSS_1 = new ol.format.GeoJSON();
var features_CantonesyareasurbanasSSS_1 = format_CantonesyareasurbanasSSS_1.readFeatures(json_CantonesyareasurbanasSSS_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_CantonesyareasurbanasSSS_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_CantonesyareasurbanasSSS_1.addFeatures(features_CantonesyareasurbanasSSS_1);
var lyr_CantonesyareasurbanasSSS_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_CantonesyareasurbanasSSS_1, 
                style: style_CantonesyareasurbanasSSS_1,
                popuplayertitle: 'Cantones y areas urbanas SSS',
                interactive: true,
    title: 'Cantones y areas urbanas SSS<br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_0.png" /> <br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_1.png" /> PANCHIMALCO<br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_2.png" /> ROSARIO DE MORA<br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_3.png" /> SAN MARCOS<br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_4.png" /> SANTIAGO TEXACUANGOS<br />\
    <img src="styles/legend/CantonesyareasurbanasSSS_1_5.png" /> SANTO TOMAS<br />' });
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
    title: 'SAN_SALVADOR_SUR<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_0.png" /> PANCHIMALCO<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_1.png" /> ROSARIO DE MORA<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_2.png" /> SAN MARCOS<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_3.png" /> SANTIAGO TEXACUANGOS<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_4.png" /> SANTO TOMAS<br />\
    <img src="styles/legend/SAN_SALVADOR_SUR_2_5.png" /> <br />' });
var format_callesintervenidascalles_3 = new ol.format.GeoJSON();
var features_callesintervenidascalles_3 = format_callesintervenidascalles_3.readFeatures(json_callesintervenidascalles_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_callesintervenidascalles_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_callesintervenidascalles_3.addFeatures(features_callesintervenidascalles_3);
var lyr_callesintervenidascalles_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_callesintervenidascalles_3, 
                style: style_callesintervenidascalles_3,
                popuplayertitle: 'calles intervenidas — calles',
                interactive: true,
                title: '<img src="styles/legend/callesintervenidascalles_3.png" /> calles intervenidas — calles'
            });
var format_Luminarias120W_4 = new ol.format.GeoJSON();
var features_Luminarias120W_4 = format_Luminarias120W_4.readFeatures(json_Luminarias120W_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Luminarias120W_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Luminarias120W_4.addFeatures(features_Luminarias120W_4);
var lyr_Luminarias120W_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Luminarias120W_4, 
                style: style_Luminarias120W_4,
                popuplayertitle: 'Luminarias 120W',
                interactive: true,
                title: '<img src="styles/legend/Luminarias120W_4.png" /> Luminarias 120W'
            });
var format_Luminarias60W60W_5 = new ol.format.GeoJSON();
var features_Luminarias60W60W_5 = format_Luminarias60W60W_5.readFeatures(json_Luminarias60W60W_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Luminarias60W60W_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Luminarias60W60W_5.addFeatures(features_Luminarias60W60W_5);
var lyr_Luminarias60W60W_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Luminarias60W60W_5, 
                style: style_Luminarias60W60W_5,
                popuplayertitle: 'Luminarias 60W — 60W',
                interactive: true,
                title: '<img src="styles/legend/Luminarias60W60W_5.png" /> Luminarias 60W — 60W'
            });
var format_CallesPanchimalcocombinado_6 = new ol.format.GeoJSON();
var features_CallesPanchimalcocombinado_6 = format_CallesPanchimalcocombinado_6.readFeatures(json_CallesPanchimalcocombinado_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_CallesPanchimalcocombinado_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_CallesPanchimalcocombinado_6.addFeatures(features_CallesPanchimalcocombinado_6);
var lyr_CallesPanchimalcocombinado_6 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_CallesPanchimalcocombinado_6, 
                style: style_CallesPanchimalcocombinado_6,
                popuplayertitle: 'Calles Panchimalco — combinado',
                interactive: true,
    title: 'Calles Panchimalco — combinado<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_0.png" /> Adoquines y piedra<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_1.png" /> Asfalto<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_2.png" /> Entrada de parque acuático <br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_3.png" /> Huella vehicular<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_4.png" /> Pavimento<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_5.png" /> Piedra<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_6.png" /> Tierra<br />\
    <img src="styles/legend/CallesPanchimalcocombinado_6_7.png" /> <br />' });
var format_Reparaciones_7 = new ol.format.GeoJSON();
var features_Reparaciones_7 = format_Reparaciones_7.readFeatures(json_Reparaciones_7, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Reparaciones_7 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Reparaciones_7.addFeatures(features_Reparaciones_7);
var lyr_Reparaciones_7 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Reparaciones_7, 
                style: style_Reparaciones_7,
                popuplayertitle: 'Reparaciones',
                interactive: true,
                title: '<img src="styles/legend/Reparaciones_7.png" /> Reparaciones'
            });
var format_Centrosdevotacion_8 = new ol.format.GeoJSON();
var features_Centrosdevotacion_8 = format_Centrosdevotacion_8.readFeatures(json_Centrosdevotacion_8, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Centrosdevotacion_8 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Centrosdevotacion_8.addFeatures(features_Centrosdevotacion_8);
var lyr_Centrosdevotacion_8 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Centrosdevotacion_8, 
                style: style_Centrosdevotacion_8,
                popuplayertitle: 'Centros de votacion',
                interactive: true,
    title: 'Centros de votacion<br />\
    <img src="styles/legend/Centrosdevotacion_8_0.png" /> 0 - 2<br />\
    <img src="styles/legend/Centrosdevotacion_8_1.png" /> 2 - 5<br />\
    <img src="styles/legend/Centrosdevotacion_8_2.png" /> 5 - 8<br />\
    <img src="styles/legend/Centrosdevotacion_8_3.png" /> 8 - 11<br />\
    <img src="styles/legend/Centrosdevotacion_8_4.png" /> 11 - 20<br />' });
var format_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9 = new ol.format.GeoJSON();
var features_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9 = format_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.readFeatures(json_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.addFeatures(features_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9);
var lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9, 
                style: style_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9,
                popuplayertitle: 'Proyecto de luminarias SSS, distrito de San Marcos — Luminarias',
                interactive: true,
                title: '<img src="styles/legend/ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.png" /> Proyecto de luminarias SSS, distrito de San Marcos — Luminarias'
            });
var format_rutasalternassansalvadorsur_10 = new ol.format.GeoJSON();
var features_rutasalternassansalvadorsur_10 = format_rutasalternassansalvadorsur_10.readFeatures(json_rutasalternassansalvadorsur_10, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_rutasalternassansalvadorsur_10 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_rutasalternassansalvadorsur_10.addFeatures(features_rutasalternassansalvadorsur_10);
var lyr_rutasalternassansalvadorsur_10 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_rutasalternassansalvadorsur_10, 
                style: style_rutasalternassansalvadorsur_10,
                popuplayertitle: 'rutas alternas san salvador sur',
                interactive: true,
                title: '<img src="styles/legend/rutasalternassansalvadorsur_10.png" /> rutas alternas san salvador sur'
            });
var format_PLANMOL2026_11 = new ol.format.GeoJSON();
var features_PLANMOL2026_11 = format_PLANMOL2026_11.readFeatures(json_PLANMOL2026_11, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_PLANMOL2026_11 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_PLANMOL2026_11.addFeatures(features_PLANMOL2026_11);
var lyr_PLANMOL2026_11 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_PLANMOL2026_11, 
                style: style_PLANMOL2026_11,
                popuplayertitle: 'PLAN MOL 2026',
                interactive: true,
                title: '<img src="styles/legend/PLANMOL2026_11.png" /> PLAN MOL 2026'
            });
var group_Proyectoalumbrado2 = new ol.layer.Group({
                                layers: [lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9,],
                                fold: 'close',
                                title: 'Proyecto alumbrado 2'});
var group_CallesdePanchimalco = new ol.layer.Group({
                                layers: [lyr_CallesPanchimalcocombinado_6,lyr_Reparaciones_7,],
                                fold: 'close',
                                title: 'Calles de Panchimalco'});
var group_Proyectoalumbrado1 = new ol.layer.Group({
                                layers: [lyr_Luminarias120W_4,lyr_Luminarias60W60W_5,],
                                fold: 'close',
                                title: 'Proyecto alumbrado 1'});
var group_CAPASDELIMITACIONES = new ol.layer.Group({
                                layers: [lyr_CantonesyareasurbanasSSS_1,lyr_SAN_SALVADOR_SUR_2,],
                                fold: 'close',
                                title: 'CAPAS DE LIMITACIONES'});

lyr_GoogleSatellite_0.setVisible(true);lyr_CantonesyareasurbanasSSS_1.setVisible(true);lyr_SAN_SALVADOR_SUR_2.setVisible(true);lyr_callesintervenidascalles_3.setVisible(true);lyr_Luminarias120W_4.setVisible(true);lyr_Luminarias60W60W_5.setVisible(true);lyr_CallesPanchimalcocombinado_6.setVisible(true);lyr_Reparaciones_7.setVisible(true);lyr_Centrosdevotacion_8.setVisible(true);lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.setVisible(true);lyr_rutasalternassansalvadorsur_10.setVisible(true);lyr_PLANMOL2026_11.setVisible(true);
var layersList = [lyr_GoogleSatellite_0,group_CAPASDELIMITACIONES,lyr_callesintervenidascalles_3,group_Proyectoalumbrado1,group_CallesdePanchimalco,lyr_Centrosdevotacion_8,group_Proyectoalumbrado2,lyr_rutasalternassansalvadorsur_10,lyr_PLANMOL2026_11];
lyr_CantonesyareasurbanasSSS_1.set('fieldAliases', {'fid': 'fid', 'OBJECTID': 'OBJECTID', 'Name': 'Name', 'FolderPath': 'FolderPath', 'PopupInfo': 'PopupInfo', 'Municipio': 'Municipio', 'Canton': 'Canton', 'Hombres': 'Hombres', 'Mujeres': 'Mujeres', 'Total': 'Total', 'Shape_Length': 'Shape_Length', 'Shape_Area': 'Shape_Area', 'PobTotal': 'PobTotal', });
lyr_SAN_SALVADOR_SUR_2.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Descripci__n': 'Descripci__n', 'NOMBRE': 'NOMBRE', 'PPTO': 'PPTO', 'HABITANTES': 'HABITANTES', 'AT': 'AT', 'MUNICIPIO': 'MUNICIPIO', });
lyr_callesintervenidascalles_3.set('fieldAliases', {'fid': 'fid', 'estado': 'estado', 'Calle ': 'Calle ', 'Proyecto': 'Proyecto', });
lyr_Luminarias120W_4.set('fieldAliases', {'qc_id': 'qc_id', 'id': 'id', 'name': 'name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudemode': 'altitudemode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'draworder': 'draworder', 'icon': 'icon', 'descripci__n': 'descripci__n', 'latitud': 'latitud', 'longitud': 'longitud', 'estado': 'estado', });
lyr_Luminarias60W60W_5.set('fieldAliases', {'qc_id': 'qc_id', 'id': 'id', 'name': 'name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudemode': 'altitudemode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'draworder': 'draworder', 'icon': 'icon', 'descripci__n': 'descripci__n', 'latitud': 'latitud', 'longitud': 'longitud', 'estado': 'estado', });
lyr_CallesPanchimalcocombinado_6.set('fieldAliases', {'fid': 'fid', 'Tipo': 'Tipo', 'src': 'src', 'geotracker_meta': 'geotracker_meta', 'layer': 'layer', 'path': 'path', 'Nombre': 'Nombre', 'img': 'img', });
lyr_Reparaciones_7.set('fieldAliases', {'fid': 'fid', 'ele': 'ele', 'time': 'time', 'magvar': 'magvar', 'geoidheight': 'geoidheight', 'name': 'name', 'cmt': 'cmt', 'desc': 'desc', 'src': 'src', 'link1_href': 'link1_href', 'link1_text': 'link1_text', 'link1_type': 'link1_type', 'link2_href': 'link2_href', 'link2_text': 'link2_text', 'link2_type': 'link2_type', 'sym': 'sym', 'type': 'type', 'fix': 'fix', 'sat': 'sat', 'hdop': 'hdop', 'vdop': 'vdop', 'pdop': 'pdop', 'ageofdgpsdata': 'ageofdgpsdata', 'dgpsid': 'dgpsid', 'layer': 'layer', 'path': 'path', });
lyr_Centrosdevotacion_8.set('fieldAliases', {'qc_id': 'qc_id', 'fid': 'fid', 'id': 'id', 'departamen': 'departamen', 'distrito': 'distrito', 'centro de': 'centro de', 'direccion': 'direccion', 'latitud': 'latitud', 'longitud': 'longitud', 'jrv': 'jrv', 'poblacion': 'poblacion', 'n ideas': 'n ideas', });
lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.set('fieldAliases', {'id': 'id', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'Estado': 'Estado', 'descripci__n': 'descripci__n', 'layer': 'layer', 'path': 'path', });
lyr_rutasalternassansalvadorsur_10.set('fieldAliases', {'fid': 'fid', 'Nombre': 'Nombre', });
lyr_PLANMOL2026_11.set('fieldAliases', {'fid': 'fid', 'N°': 'N°', 'DISTRITO': 'DISTRITO', 'UBICACIÓN': 'UBICACIÓN', 'DESCRIPCION': 'DESCRIPCION', 'LATITUD': 'LATITUD', 'LONGITUD': 'LONGITUD', });
lyr_CantonesyareasurbanasSSS_1.set('fieldImages', {'fid': 'TextEdit', 'OBJECTID': 'TextEdit', 'Name': 'TextEdit', 'FolderPath': 'TextEdit', 'PopupInfo': 'TextEdit', 'Municipio': 'TextEdit', 'Canton': 'TextEdit', 'Hombres': 'Range', 'Mujeres': 'Range', 'Total': 'Range', 'Shape_Length': 'TextEdit', 'Shape_Area': 'TextEdit', 'PobTotal': 'TextEdit', });
lyr_SAN_SALVADOR_SUR_2.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Descripci__n': 'TextEdit', 'NOMBRE': 'TextEdit', 'PPTO': 'TextEdit', 'HABITANTES': 'TextEdit', 'AT': 'TextEdit', 'MUNICIPIO': 'TextEdit', });
lyr_callesintervenidascalles_3.set('fieldImages', {'fid': 'TextEdit', 'estado': 'TextEdit', 'Calle ': 'TextEdit', 'Proyecto': 'TextEdit', });
lyr_Luminarias120W_4.set('fieldImages', {'qc_id': 'TextEdit', 'id': 'TextEdit', 'name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudemode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'draworder': 'Range', 'icon': 'TextEdit', 'descripci__n': 'TextEdit', 'latitud': 'TextEdit', 'longitud': 'TextEdit', 'estado': 'TextEdit', });
lyr_Luminarias60W60W_5.set('fieldImages', {'qc_id': 'TextEdit', 'id': 'TextEdit', 'name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudemode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'draworder': 'Range', 'icon': 'TextEdit', 'descripci__n': 'TextEdit', 'latitud': 'TextEdit', 'longitud': 'TextEdit', 'estado': 'TextEdit', });
lyr_CallesPanchimalcocombinado_6.set('fieldImages', {'fid': 'TextEdit', 'Tipo': 'TextEdit', 'src': 'TextEdit', 'geotracker_meta': 'TextEdit', 'layer': 'TextEdit', 'path': 'TextEdit', 'Nombre': 'TextEdit', 'img': 'ExternalResource', });
lyr_Reparaciones_7.set('fieldImages', {'fid': '', 'ele': '', 'time': '', 'magvar': '', 'geoidheight': '', 'name': '', 'cmt': '', 'desc': '', 'src': '', 'link1_href': '', 'link1_text': '', 'link1_type': '', 'link2_href': '', 'link2_text': '', 'link2_type': '', 'sym': '', 'type': '', 'fix': '', 'sat': '', 'hdop': '', 'vdop': '', 'pdop': '', 'ageofdgpsdata': '', 'dgpsid': '', 'layer': '', 'path': '', });
lyr_Centrosdevotacion_8.set('fieldImages', {'qc_id': 'TextEdit', 'fid': 'TextEdit', 'id': 'TextEdit', 'departamen': 'TextEdit', 'distrito': 'TextEdit', 'centro de': 'TextEdit', 'direccion': 'TextEdit', 'latitud': 'TextEdit', 'longitud': 'TextEdit', 'jrv': 'TextEdit', 'poblacion': 'TextEdit', 'n ideas': 'TextEdit', });
lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.set('fieldImages', {'id': 'TextEdit', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'Estado': 'TextEdit', 'descripci__n': 'TextEdit', 'layer': 'TextEdit', 'path': 'TextEdit', });
lyr_rutasalternassansalvadorsur_10.set('fieldImages', {'fid': 'TextEdit', 'Nombre': 'TextEdit', });
lyr_PLANMOL2026_11.set('fieldImages', {'fid': 'TextEdit', 'N°': 'Range', 'DISTRITO': 'TextEdit', 'UBICACIÓN': 'TextEdit', 'DESCRIPCION': 'TextEdit', 'LATITUD': 'TextEdit', 'LONGITUD': 'TextEdit', });
lyr_CantonesyareasurbanasSSS_1.set('fieldLabels', {'fid': 'no label', 'OBJECTID': 'no label', 'Name': 'no label', 'FolderPath': 'no label', 'PopupInfo': 'no label', 'Municipio': 'no label', 'Canton': 'no label', 'Hombres': 'no label', 'Mujeres': 'no label', 'Total': 'no label', 'Shape_Length': 'no label', 'Shape_Area': 'no label', 'PobTotal': 'no label', });
lyr_SAN_SALVADOR_SUR_2.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Descripci__n': 'no label', 'NOMBRE': 'no label', 'PPTO': 'no label', 'HABITANTES': 'no label', 'AT': 'no label', 'MUNICIPIO': 'no label', });
lyr_callesintervenidascalles_3.set('fieldLabels', {'fid': 'no label', 'estado': 'no label', 'Calle ': 'no label', 'Proyecto': 'no label', });
lyr_Luminarias120W_4.set('fieldLabels', {'qc_id': 'no label', 'id': 'no label', 'name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudemode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'draworder': 'no label', 'icon': 'no label', 'descripci__n': 'no label', 'latitud': 'no label', 'longitud': 'no label', 'estado': 'no label', });
lyr_Luminarias60W60W_5.set('fieldLabels', {'qc_id': 'no label', 'id': 'no label', 'name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudemode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'draworder': 'no label', 'icon': 'no label', 'descripci__n': 'no label', 'latitud': 'no label', 'longitud': 'no label', 'estado': 'no label', });
lyr_CallesPanchimalcocombinado_6.set('fieldLabels', {'fid': 'no label', 'Tipo': 'no label', 'src': 'no label', 'geotracker_meta': 'no label', 'layer': 'no label', 'path': 'no label', 'Nombre': 'no label', 'img': 'no label', });
lyr_Reparaciones_7.set('fieldLabels', {'fid': 'no label', 'ele': 'no label', 'time': 'no label', 'magvar': 'no label', 'geoidheight': 'no label', 'name': 'no label', 'cmt': 'no label', 'desc': 'no label', 'src': 'no label', 'link1_href': 'no label', 'link1_text': 'no label', 'link1_type': 'no label', 'link2_href': 'no label', 'link2_text': 'no label', 'link2_type': 'no label', 'sym': 'no label', 'type': 'no label', 'fix': 'no label', 'sat': 'no label', 'hdop': 'no label', 'vdop': 'no label', 'pdop': 'no label', 'ageofdgpsdata': 'no label', 'dgpsid': 'no label', 'layer': 'no label', 'path': 'no label', });
lyr_Centrosdevotacion_8.set('fieldLabels', {'qc_id': 'no label', 'fid': 'no label', 'id': 'no label', 'departamen': 'no label', 'distrito': 'no label', 'centro de': 'no label', 'direccion': 'no label', 'latitud': 'no label', 'longitud': 'no label', 'jrv': 'no label', 'poblacion': 'no label', 'n ideas': 'no label', });
lyr_ProyectodeluminariasSSSdistritodeSanMarcosLuminarias_9.set('fieldLabels', {'id': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'Estado': 'no label', 'descripci__n': 'no label', 'layer': 'no label', 'path': 'no label', });
lyr_rutasalternassansalvadorsur_10.set('fieldLabels', {'fid': 'no label', 'Nombre': 'no label', });
lyr_PLANMOL2026_11.set('fieldLabels', {'fid': 'no label', 'N°': 'no label', 'DISTRITO': 'no label', 'UBICACIÓN': 'no label', 'DESCRIPCION': 'no label', 'LATITUD': 'no label', 'LONGITUD': 'no label', });
lyr_PLANMOL2026_11.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});