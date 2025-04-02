insert into categoria (nombre,descripcion) values ('Smartphones','Descripcion Smartphones');
insert into categoria (nombre,descripcion) values ('Laptops','Descripcion Laptops');
insert into categoria (nombre,descripcion) values ('Accesorios','Descripcion Accesorios');
insert into categoria (nombre,descripcion) values ('Audio','Descripcion Audio');
insert into categoria (nombre,descripcion) values ('Almacenamiento','Descripcion Almacenamiento');

select * from categoria;

INSERT INTO PRODUCTO (nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, categoria_id)
VALUES ('iPhone 15 Pro', 999.99, 'Apple', 'Último modelo de iPhone con chip A17 Bionic', 'Pantalla 6.1", 256GB almacenamiento, Triple cámara 48MP, iOS 17', 75, 'https://ejemplo.com/imagenes/iphone15pro.jpg', 1);
INSERT INTO PRODUCTO (nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, categoria_id)
VALUES ('MacBook Air M3', 1299.00, 'Apple', 'Laptop ultraligera con el nuevo chip M3', 'Pantalla Retina 13.6", 16GB RAM, 512GB SSD, macOS Sonoma', 32, 'https://ejemplo.com/imagenes/macbookair-m3.jpg', 2);
INSERT INTO PRODUCTO (nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, categoria_id)
VALUES ('Magic Mouse 3', 79.99, 'Apple', 'Mouse inalámbrico con superficie táctil', 'Recargable, Bluetooth 5.0, Superficie Multi-Touch, Diseño ergonómico', 120, 'https://ejemplo.com/imagenes/magicmouse3.jpg', 3);
INSERT INTO PRODUCTO (nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, categoria_id)
VALUES ('Sony WH-1000XM5', 349.95, 'Sony', 'Auriculares premium con cancelación de ruido', 'Bluetooth 5.2, 30 horas de batería, Micrófono integrado, Audio de alta resolución', 45, 'https://ejemplo.com/imagenes/sony-wh1000xm5.jpg', 4);
INSERT INTO PRODUCTO (nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, categoria_id)
VALUES ('SSD Samsung 990 Pro 2TB', 229.99, 'Samsung', 'Unidad de estado sólido de alta velocidad', 'NVMe PCIe 4.0, 7450MB/s lectura, 6900MB/s escritura, Disipador incluido', 60, 'https://ejemplo.com/imagenes/samsung-990pro.jpg', 5);

select * from producto;

INSERT INTO USUARIO (nombre, email, password, telefono, es_admin)
VALUES ('Carlos Rodríguez', 'carlos.rodriguez@ejemplo.com', '$2a$12$8KpW3FO7h4XR0vDYzI8GUuK9kZ7LK8cqXpxD1oKg9L1UPpyXOJFHu', '+34612345678', TRUE);
INSERT INTO USUARIO (nombre, email, password, telefono)
VALUES ('Ana Martínez', 'ana.martinez@ejemplo.com', '$2a$12$lXjGyPzRv5bR9Z6s2rDKHOZW1SY5DI0FmG4jF5hMxR7EhVz8QKJJC', '+34623456789');
INSERT INTO USUARIO (nombre, email, password, telefono)
VALUES ('Javier López', 'javier.lopez@ejemplo.com', '$2a$12$tM4BXlOkJ9E5.0KlP9uDPO3TjdxF3XjWWcS1VQwYV7.O.xVYzH6Ku', '+34634567890');
INSERT INTO USUARIO (nombre, email, password, telefono)
VALUES ('María García', 'maria.garcia@ejemplo.com', '$2a$12$45d8rYTzKGfpPHn9fqMPCOU.IuJ7YCaPv4qKX2btKW5iY0Yq8qM4O', '+34645678901');
INSERT INTO USUARIO (nombre, email, password, telefono)
VALUES ('Pedro Sánchez', 'pedro.sanchez@ejemplo.com', '$2a$12$wRCjFIrXbT4CgwUgQAJz3ecYNsO7CDKXsFmrJEMFjVtpnUvMZU2OW', '+34656789012');

select * from usuario;

-- Insert en la tabla orden
INSERT INTO orden (usuario_id, total, estado, direccion_envio)
VALUES (2, 1527.92, 'Procesando', 'Calle Principal 123, Piso 4B, Madrid, España');

-- Inserts en la tabla detalle_orden (suponiendo que la orden insertada tiene id=1)
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 1, 1, 999.99, 999.99);
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 3, 2, 79.99, 159.98);
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 4, 1, 349.95, 349.95);
INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 5, 1, 229.99, 229.99);


SELECT 
    o.id AS orden_id,
    o.fecha_creacion,
    o.total,
    o.estado,
    o.direccion_envio,
    u.id AS usuario_id,
    u.nombre AS nombre_usuario,
    u.email,
    u.telefono,
    dd.producto_id,
    p.nombre AS nombre_producto,
    p.marca,
    dd.cantidad,
    dd.precio_unitario,
    dd.subtotal
FROM orden o
JOIN usuario u ON o.usuario_id = u.id
JOIN detalle_orden dd ON o.id = dd.orden_id
JOIN producto p ON dd.producto_id = p.id
ORDER BY o.id, dd.producto_id;
