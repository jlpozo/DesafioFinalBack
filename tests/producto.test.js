const request = require("supertest");
const express = require("express");

// Crear un servidor express simple para las pruebas
const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Datos de productos para tests
const productos = [
  { id: 1, nombre: "Smartphone Pro", precio: "999.99", stock: 50, categoria_id: 1, marca: "TechBrand" },
  { id: 2, nombre: "Laptop UltraBook", precio: "1299.99", stock: 30, categoria_id: 2, marca: "TechPro" }
];

// Configurar rutas básicas
app.get("/api/v1/productos", (req, res) => {
  // Simular paginación
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 10;
  
  res.status(200).json({ 
    productos: productos,
    total: 20, // Total ficticio
    pagina: pagina,
    paginas: Math.ceil(20 / limite)
  });
});

app.get("/api/v1/productos/categoria/:idCategoria", (req, res) => {
  const idCategoria = parseInt(req.params.idCategoria);
  
  // Filtrar productos por categoría
  const productosFiltrados = productos.filter(p => p.categoria_id === idCategoria);
  
  res.status(200).json({
    categoria_id: idCategoria,
    total: productosFiltrados.length,
    productos: productosFiltrados
  });
});

app.get("/api/v1/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  
  // Producto no encontrado
  if (id === 999) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  
  // Devolver producto específico
  const producto = productos.find(p => p.id === id) || productos[0];
  
  res.status(200).json({
    ...producto,
    categoria: {
      id: producto.categoria_id,
      nombre: producto.categoria_id === 1 ? "Smartphones" : "Laptops"
    }
  });
});

app.post("/api/v1/productos", (req, res) => {
  const token = req.headers.authorization;
  
  // Sin token
  if (!token) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }
  
  // No es admin
  if (!token.includes("token-admin")) {
    return res.status(403).json({ mensaje: "Requiere permisos de administrador" });
  }
  
  // Crear producto
  const nuevoProducto = {
    id: 3,
    ...req.body,
    fecha_creacion: new Date()
  };
  
  res.status(201).json(nuevoProducto);
});

app.put("/api/v1/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const token = req.headers.authorization;
  
  // Sin token o no es admin
  if (!token || !token.includes("token-admin")) {
    return res.status(403).json({ mensaje: "No autorizado" });
  }
  
  // Producto no encontrado
  if (id === 999) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  
  // Actualizar producto
  const productoActualizado = {
    id: id,
    ...req.body
  };
  
  res.status(200).json(productoActualizado);
});

app.delete("/api/v1/productos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const token = req.headers.authorization;
  
  // Sin token o no es admin
  if (!token || !token.includes("token-admin")) {
    return res.status(403).json({ mensaje: "No autorizado" });
  }
  
  // Producto no encontrado
  if (id === 999) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }
  
  res.status(200).json({ mensaje: "Producto eliminado correctamente", id: id });
});

describe("Operaciones CRUD de productos", () => {
  // Test 1: Listar productos
  it("GET /productos devuelve status 200 y productos paginados", async () => {
    const response = await request(app).get("/api/v1/productos");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("productos");
    expect(Array.isArray(response.body.productos)).toBe(true);
    expect(response.body.productos.length).toBeGreaterThan(0);
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("pagina");
  });

  // Test 2: Filtrar productos por categoría
  it("GET /productos/categoria/:idCategoria devuelve productos de esa categoría", async () => {
    const response = await request(app).get("/api/v1/productos/categoria/1");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("categoria_id", 1);
    expect(response.body).toHaveProperty("productos");
    expect(Array.isArray(response.body.productos)).toBe(true);
  });

  // Test 3: Obtener un producto por ID
  it("GET /productos/:id devuelve status 200 y el producto solicitado", async () => {
    const response = await request(app).get("/api/v1/productos/1");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("nombre", "Smartphone Pro");
    expect(response.body).toHaveProperty("categoria");
  });

  // Test 4: Producto no encontrado
  it("GET /productos/:id devuelve 404 si el producto no existe", async () => {
    const response = await request(app).get("/api/v1/productos/999");
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Producto no encontrado");
  });

  // Test 5: Crear un producto requiere autenticación
  it("POST /productos requiere autenticación", async () => {
    const nuevoProducto = {
      nombre: "Nuevo Smartphone",
      precio: 599.99,
      stock: 100,
      categoria_id: 1
    };

    const response = await request(app)
      .post("/api/v1/productos")
      .send(nuevoProducto);
    
    expect(response.statusCode).toBe(401);
  });

  // Test 6: Crear un producto requiere ser admin
  it("POST /productos requiere rol de administrador", async () => {
    const nuevoProducto = {
      nombre: "Nuevo Smartphone",
      precio: 599.99,
      stock: 100,
      categoria_id: 1
    };

    const response = await request(app)
      .post("/api/v1/productos")
      .set("Authorization", "Bearer token-usuario")
      .send(nuevoProducto);
    
    expect(response.statusCode).toBe(403);
  });

  // Test 7: Crear un producto exitosamente
  it("POST /productos crea un producto y devuelve status 201", async () => {
    const nuevoProducto = {
      nombre: "Nuevo Smartphone",
      precio: 599.99,
      stock: 100,
      categoria_id: 1
    };

    const response = await request(app)
      .post("/api/v1/productos")
      .set("Authorization", "Bearer token-admin")
      .send(nuevoProducto);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id", 3);
    expect(response.body).toHaveProperty("nombre", "Nuevo Smartphone");
  });

  // Test 8: Actualizar un producto
  it("PUT /productos/:id actualiza un producto y devuelve status 200", async () => {
    const productoActualizado = {
      nombre: "Smartphone Pro Max",
      precio: 1099.99
    };

    const response = await request(app)
      .put("/api/v1/productos/1")
      .set("Authorization", "Bearer token-admin")
      .send(productoActualizado);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("nombre", "Smartphone Pro Max");
  });

  // Test 9: Eliminar un producto
  it("DELETE /productos/:id elimina un producto y devuelve status 200", async () => {
    const response = await request(app)
      .delete("/api/v1/productos/1")
      .set("Authorization", "Bearer token-admin");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Producto eliminado correctamente");
  });
});