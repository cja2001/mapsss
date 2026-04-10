CREATE DATABASE IF NOT EXISTS leaflet_practica;
USE leaflet_practica;

CREATE TABLE IF NOT EXISTS puntos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL
);

INSERT INTO puntos (nombre, categoria, lat, lng) VALUES
('Alcaldía de San Salvador', 'Institución', 13.6989, -89.1914),
('Parque Cuscatlán', 'Parque', 13.7007, -89.2111),
('Hospital Rosales', 'Salud', 13.6995, -89.2013),
('Universidad de El Salvador', 'Educación', 13.7196, -89.2034);
