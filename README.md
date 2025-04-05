# DesafioFinalBack - API para Desafio final marketplace

API REST para gestionar un marketplace de productos tecnológicos. Desarrollado con Node.js, Express y PostgreSQL.

## Estructura del proyecto

```
DesafioFinalBack/
├── config/                # Configuración de la aplicación
│   ├── database.js        # Configuración de conexión a PostgreSQL
│   └── jwt.js             # Configuración de JWT para autenticación
├── controllers/           # Controladores de la API
│   ├── categoriaController.js
│   ├── ordenController.js
│   ├── productoController.js
│   └── usuarioController.js
├── middlewares/           # Middlewares
│   ├── admin.js           # Verificación de rol admin
│   ├── auth.js            # Autenticación de usuarios
│   ├── errorHandler.js    # Manejo centralizado de errores
│   └── validation.js      # Validación de datos
├── routes/                # Rutas de la API
│   ├── categoria.routes.js
│   ├── index.js           # Índice de rutas
│   ├── orden.routes.js
│   ├── producto.routes.js
│   └── usuario.routes.js
├── .env                   # Variables de entorno
├── Create_DesafioMKP.sql  # Script SQL para crear la base de datos
├── package.json
├── Script_Llenado.sql.js  # Script para inicializar datos de prueba
└── server.js              # Archivo principal del servidor
```

## Requisitos previos

- Node.js (v22+)
- PostgreSQL (v12+)

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/jlpozo/DesafioFinalBack.git
   cd DesafioFinalBack
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Editar las variables según tu entorno

4. Crear la base de datos en PostgreSQL:
   ```
   psql -U postgres -f Create_DesafioMKP.sql
   ```

5. Inicializar datos de prueba (opcional):
   ```
   node Script_Llenado.sql.js
   ```

## Ejecución

- Modo desarrollo:
  ```
  npm run dev
  ```

- Modo producción:
  ```
  npm start
  ```

## Endpoints de la API

### Usuarios

- `POST /api/v1/usuarios/registro` - Registrar un nuevo usuario
- `POST /api/v1/usuarios/login` - Iniciar sesión
- `GET /api/v1/usuarios/perfil` - Obtener perfil del usuario autenticado
- `PUT /api/v1/usuarios/perfil` - Actualizar perfil del usuario autenticado

### Categorías

- `GET /api/v1/categorias` - Listar todas las categorías
- `GET /api/v1/categorias/:id` - Obtener categoría por ID con sus productos
- `POST /api/v1/categorias` - Crear nueva categoría (solo admin)
- `PUT /api/v1/categorias/:id` - Actualizar categoría (solo admin)
- `DELETE /api/v1/categorias/:id` - Eliminar categoría (solo admin)

### Productos

- `GET /api/v1/productos` - Listar productos con paginación y filtros
- `GET /api/v1/productos/categoria/:idCategoria` - Listar productos por categoría con paginación
- `GET /api/v1/productos/:id` - Obtener producto por ID
- `POST /api/v1/productos` - Crear nuevo producto (solo admin)
- `PUT /api/v1/productos/:id` - Actualizar producto (solo admin)
- `DELETE /api/v1/productos/:id` - Eliminar producto (solo admin)

### Órdenes

- `GET /api/v1/ordenes` - Listar órdenes del usuario autenticado
- `GET /api/v1/ordenes/:id` - Obtener orden específica con sus detalles
- `POST /api/v1/ordenes` - Crear nueva orden
- `PATCH /api/v1/ordenes/:id` - Actualizar estado de orden (solo admin)
- `POST /api/v1/ordenes/:id/productos` - Añadir productos a una orden existente
- `PUT /api/v1/ordenes/:orden_id/productos/:detalle_id` - Actualizar cantidad de un producto
- `DELETE /api/v1/ordenes/:orden_id/productos/:detalle_id` - Eliminar un producto de la orden

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas:

1. Obtener token mediante el endpoint de login
2. Incluir el token en el header de las solicitudes:
   ```
   Authorization: Bearer <token>
   ```

## Datos de acceso predeterminados
### Usuario administrador
- Email: admin@prueba.cl
- Contraseña: admin123

### Usuario comprador
- Email: usuario@prueba.cl
- Contraseña: 123456


## Pruebas

Para ejecutar las pruebas:

```
npm test
```