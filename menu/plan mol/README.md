# Práctica: Leaflet + PHP + MySQL

Este proyecto sirve para practicar cómo cargar puntos en Leaflet desde una base de datos MySQL.

## Archivos incluidos

- `index.html`: estructura principal
- `style.css`: estilos básicos
- `app.js`: lógica del mapa y carga de datos
- `api.php`: consulta la base de datos y devuelve JSON
- `db.sql`: crea la base de datos y la tabla con datos de ejemplo

## Cómo probarlo en XAMPP

1. Copia la carpeta `leaflet_practica` dentro de `htdocs`.
2. Abre phpMyAdmin.
3. Importa el archivo `db.sql`.
4. Verifica que en `api.php` coincidan estas credenciales:
   - host: `localhost`
   - usuario: `root`
   - contraseña: vacía por defecto en XAMPP
   - base de datos: `leaflet_practica`
5. Enciende Apache y MySQL en XAMPP.
6. Abre en el navegador:

```text
http://localhost/leaflet_practica/
```

## Qué puedes practicar después

- Cambiar `L.marker()` por `L.circleMarker()`
- Filtrar por categoría
- Mostrar iconos personalizados
- Cargar GeoJSON en lugar de puntos simples
- Conectar con PostgreSQL/PostGIS
