<?php
header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$usuario = 'root';
$contrasena = '';
$base_datos = 'leaflet_practica';

$conn = new mysqli($host, $usuario, $contrasena, $base_datos);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Error de conexión a la base de datos",
        "detalle" => $conn->connect_error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "SELECT id, nombre, tipo, lat, lng FROM puntos";
$resultado = $conn->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode([
        "error" => "Error en la consulta SQL",
        "detalle" => $conn->error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$features = [];

while ($fila = $resultado->fetch_assoc()) {
    $features[] = [
        "type" => "Feature",
        "properties" => [
            "id" => (int)$fila["id"],
            "nombre" => $fila["nombre"],
            "tipo" => $fila["tipo"]
        ],
        "geometry" => [
            "type" => "Point",
            "coordinates" => [
                (float)$fila["lng"],
                (float)$fila["lat"]
            ]
        ]
    ];
}

echo json_encode([
    "type" => "FeatureCollection",
    "features" => $features
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$conn->close();
?>

