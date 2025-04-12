-- Image 1 Products
delete from detalle_orden;
delete from producto where categoria_id = 2;
delete from producto where categoria_id = 1;

-- ASUS Vivobook Go 14 E1404
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    48743, 
    'Notebook Vivobook Go 14 E1404 Intel Core i3-N305', 
    419990, 
    'ASUS', 
    'Notebook Vivobook Go 14 E1404 Intel Core i3-N305 8GB RAM 256GB SSD 14" HD', 
    'Procesador: Intel Core i3-N305
Memoria RAM: 8GB
Almacenamiento: 256GB SSD
Pantalla: 14" HD
Descuento: 26%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/48743/1_500.jpg?t=1744203653742', 
    CURRENT_DATE, 
    2);

-- ASUS TUF Gaming A15
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    51462, 
    'Notebook Gamer TUF A15 AMD Ryzen 5 7535HS', 
    689990, 
    'ASUS', 
    'Notebook Gamer TUF A15 AMD Ryzen 5 7535HS 16GB RAM 512GB SSD RTX 3050 15.6" FHD 144Hz', 
    'Procesador: AMD Ryzen 5 7535HS
Memoria RAM: 16GB
Almacenamiento: 512GB SSD
Tarjeta Gráfica: NVIDIA RTX 3050
Pantalla: 15.6" FHD 144Hz
Descuento: 36%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/51462/1_500.jpg?t=1744203895240', 
    CURRENT_DATE, 
    2);

-- Dell Inspiron 3520
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    51919, 
    'Notebook Inspiron 3520 Intel Core i7-1255U', 
    739990, 
    'Dell', 
    'Notebook Inspiron 3520 Intel Core i7-1255U 15.6" FHD 8GB RAM 512GB SSD', 
    'Procesador: Intel Core i7-1255U
Memoria RAM: 8GB
Almacenamiento: 512GB SSD
Pantalla: 15.6" FHD
Descuento: 4%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/51919/1_500.jpg?t=1743421183363', 
    CURRENT_DATE, 
    2);

-- ASUS Vivobook 16
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    52347, 
    'Notebook Vivobook 16 Intel Core i7-12700H', 
    739990, 
    'ASUS', 
    'Notebook Vivobook 16 Intel Core i7-12700H 16.0" FHD 16GB RAM 512GB SSD', 
    'Procesador: Intel Core i7-12700H
Memoria RAM: 16GB
Almacenamiento: 512GB SSD
Pantalla: 16.0" FHD
Descuento: 28%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/52347/1_500.jpg?t=1744203668111', 
    CURRENT_DATE, 
    2);

-- Image 2 Products

-- Dell Inspiron 3535
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53822, 
    'Notebook Inspiron 3535 AMD Ryzen 5 7520U', 
    569990, 
    'Dell', 
    'Notebook Inspiron 3535 AMD Ryzen 5 7520U 15.6" FHD 8GB RAM 512GB SSD', 
    'Procesador: AMD Ryzen 5 7520U
Memoria RAM: 8GB
Almacenamiento: 512GB SSD
Pantalla: 15.6" FHD', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53822/1_500.jpg?t=1737722611383', 
    CURRENT_DATE, 
    2);

-- ASUS TUF Gaming A15 (2nd version)
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53520, 
    'Notebook Gamer TUF A15 AMD Ryzen 7 7735HS', 
    1329990, 
    'ASUS', 
    'Notebook Gamer TUF A15 AMD Ryzen 7 7735HS 15.6" FHD 16GB RAM 512GB SSD RTX 4060', 
    'Procesador: AMD Ryzen 7 7735HS
Memoria RAM: 16GB
Almacenamiento: 512GB SSD
Tarjeta Gráfica: NVIDIA RTX 4060
Pantalla: 15.6" FHD
Descuento: 24%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53520/1_500.jpg?t=1744203673737', 
    CURRENT_DATE, 
    2);

-- Dell Ryzen 7
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53218, 
    'Notebook AMD Ryzen 7 7730U', 
    769990, 
    'Dell', 
    'Notebook AMD Ryzen 7 7730U 15.6" FHD 12GB RAM 512GB SSD', 
    'Procesador: AMD Ryzen 7 7730U
Memoria RAM: 12GB
Almacenamiento: 512GB SSD
Pantalla: 15.6" FHD
Descuento: 12%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53218/1_500.jpg?t=1742558745221', 
    CURRENT_DATE, 
    2);

-- ASUS Vivobook 15
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53880, 
    'Notebook Vivobook 15 Intel Core i5-1340H', 
    669990, 
    'ASUS', 
    'Notebook Vivobook 15 Intel Core i5-1340H 15.6" FHD 16GB RAM 512GB SSD', 
    'Procesador: Intel Core i5-1340H
Memoria RAM: 16GB
Almacenamiento: 512GB SSD
Pantalla: 15.6" FHD
Descuento: 17%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53880/1_500.jpg?t=1744203899285', 
    CURRENT_DATE, 
    2);

-- Smartphone Products (Category 1)

-- Motorola Moto G55
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53734, 
    'Celular Moto G55 256GB/8GB 5G Verde', 
    209290, 
    'Motorola', 
    'Celular Moto G55 256GB/8GB 5G Verde Liberado', 
    'Almacenamiento: 256GB
Memoria RAM: 8GB
Conectividad: 5G
Color: Verde
Estado: Liberado
Descuento: 12%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53754/1_500.jpg?t=1744117202419', 
    CURRENT_DATE, 
    1);

-- Motorola Moto G15
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53952, 
    'Celular Moto G15 128GB/4GB Gris Liberado', 
    136090, 
    'Motorola', 
    'Celular Moto G15 128GB/4GB Gris Liberado', 
    'Almacenamiento: 128GB
Memoria RAM: 4GB
Color: Gris
Estado: Liberado
Descuento: 12%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53952/1_500.jpg?t=1743767225375', 
    CURRENT_DATE, 
    1);

-- Xiaomi Poco C75
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53570, 
    'Celular Xiaomi Poco C75 128GB/6GB Negro Liberado', 
    113390, 
    'Xiaomi', 
    'Celular Xiaomi Poco C75 128GB/6GB Negro Liberado', 
    'Almacenamiento: 128GB
Memoria RAM: 6GB
Color: Negro
Estado: Liberado
Descuento: 21%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53570/1_500.jpg?t=1744148964142', 
    CURRENT_DATE, 
    1);

-- Motorola Moto G05
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53951, 
    'Celular Moto G05 64GB/4GB Verde Liberado', 
    106190, 
    'Motorola', 
    'Celular Moto G05 64GB/4GB Verde Liberado', 
    'Almacenamiento: 64GB
Memoria RAM: 4GB
Color: Verde
Estado: Liberado
Descuento: 14%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53951/1_500.jpg?t=1744030162784', 
    CURRENT_DATE, 
    1);

-- Motorola E15
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53953, 
    'Celular Motorola E15 64GB/2GB Azul Liberado', 
    87490, 
    'Motorola', 
    'Celular Motorola E15 64GB/2GB Azul Liberado', 
    'Almacenamiento: 64GB
Memoria RAM: 2GB
Color: Azul
Estado: Liberado
Descuento: 11%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53953/1_500.jpg?t=1744203878970', 
    CURRENT_DATE, 
    1);

-- Xiaomi Poco C75 (256GB)
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53571, 
    'Celular Xiaomi Poco C75 256GB/8GB Negro Liberado', 
    135090, 
    'Xiaomi', 
    'Celular Xiaomi Poco C75 256GB/8GB Negro Liberado', 
    'Almacenamiento: 256GB
Memoria RAM: 8GB
Color: Negro
Estado: Liberado
Descuento: 18%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53571/1_500.jpg?t=1744117198518', 
    CURRENT_DATE, 
    1);

-- Samsung Galaxy S24
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53838, 
    'Celular Samsung Galaxy S24 128GB/8GB 5G Violeta', 
    639190, 
    'Samsung', 
    'Celular Samsung Galaxy S24 128GB/8GB 5G Violeta Liberado', 
    'Almacenamiento: 128GB
Memoria RAM: 8GB
Conectividad: 5G
Color: Violeta
Estado: Liberado
Descuento: 36%', 
    100, 
    'https://assets.pcfactory.cl/public/foto/53858/1_500.jpg?t=1743531543538', 
    CURRENT_DATE, 
    1);

-- Motorola Moto G24 Power
INSERT INTO producto(
    id, nombre, precio, marca, descripcion, caracteristicas, stock, imagen_url, fecha_creacion, categoria_id)
VALUES (
    53719, 
    'Celular Moto G24 Power 256GB/4GB Azul Liberado', 
    113390, 
    'Motorola', 
    'Celular Moto G24 Power 256GB/4GB Azul Liberado', 
    'Almacenamiento: 256GB
Memoria RAM: 4GB
Modelo: G24 Power
Color: Azul
Estado: Liberado
Descuento: 27%', 
    50, 
    'https://assets.pcfactory.cl/public/foto/51719/1_500.jpg?t=1744203881004', 
    CURRENT_DATE, 
    1);	

commit;



