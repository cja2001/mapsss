var size = 0;
var placement = 'point';
function categories_CantonesyareasurbanasSSS_1(feature, value, size, resolution, labelText,
                       labelFont, labelFill, bufferColor, bufferWidth,
                       placement) {
                var valueStr = (value !== null && value !== undefined) ? value.toString() : 'default';
                switch(valueStr) {default:
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'PANCHIMALCO':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'ROSARIO DE MORA':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'SAN MARCOS':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'SANTIAGO TEXACUANGOS':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;
case 'SANTO TOMAS':
                    return [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,86,255,1.0)', lineDash: null, lineCap: 'butt', lineJoin: 'miter', width: 0.988}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth)
    })];
                    break;}};

var style_CantonesyareasurbanasSSS_1 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("Municipio");
    var labelFont = "6.5px \'Open Sans\', sans-serif";
    var labelFill = "#000000";
    var bufferColor = "#fafafa";
    var bufferWidth = 3.0;
    var textAlign = "left";
    var offsetX = 0;
    var offsetY = 0;
    var placement = 'point';
    if (feature.get("Canton") !== null) {
        labelText = String(feature.get("Canton"));
    }
    
    var style = categories_CantonesyareasurbanasSSS_1(feature, value, size, resolution, labelText,
                            labelFont, labelFill, bufferColor,
                            bufferWidth, placement);

    return style;
};
