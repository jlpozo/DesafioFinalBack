-- Script para crear la base de datos DesafioMKP
CREATE DATABASE DesafioMKP;

-- Conectar a la base de datos
\c DesafioMKP;

-- Tabla CATEGORIA
CREATE TABLE CATEGORIA (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla PRODUCTO
CREATE TABLE PRODUCTO (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    marca VARCHAR(100),
    descripcion TEXT,
    caracteristicas TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria_id INTEGER NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(id)
);

-- Tabla USUARIO
CREATE TABLE USUARIO (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    es_admin BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ORDEN
CREATE TABLE ORDEN (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    direccion_envio TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id)
);

-- Tabla DETALLE_ORDEN con llave compuesta
CREATE TABLE DETALLE_ORDEN (
    orden_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (orden_id, producto_id),
    FOREIGN KEY (orden_id) REFERENCES ORDEN(id),
    FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_producto_categoria ON PRODUCTO(categoria_id);
CREATE INDEX idx_orden_usuario ON ORDEN(usuario_id);
CREATE INDEX idx_detalle_orden_producto ON DETALLE_ORDEN(producto_id);

-- Comentarios de la base de datos
COMMENT ON DATABASE DesafioMKP IS 'Base de datos para la aplicación de marketplace DesafioMKP';

-- Comentarios de tablas
COMMENT ON TABLE CATEGORIA IS 'Categorías de productos';
COMMENT ON TABLE PRODUCTO IS 'Productos disponibles en el marketplace';
COMMENT ON TABLE USUARIO IS 'Usuarios registrados en la plataforma';
COMMENT ON TABLE ORDEN IS 'Órdenes de compra realizadas por los usuarios';
COMMENT ON TABLE DETALLE_ORDEN IS 'Detalles de productos en cada orden';