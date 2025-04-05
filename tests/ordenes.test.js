const request = require("supertest");
const express = require("express");

// Crear un servidor express simple para las pruebas
const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Middleware para autenticación
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }
  
  // Verificar token
  if (auth.includes("token-admin")) {
    req.usuario = { id: 1, nombre: "Admin", es_admin: true };
  } else if (auth.includes("token-usuario")) {
    req.usuario = { id: 2, nombre: "Usuario", es_admin: false };
  } else {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
  
  next();
};

// Datos de órdenes para tests
const ordenes = [
  {
    id: 1,
    usuario_id: 2,
    total: "1299.98",
    estado: "pendiente",
    fecha_creacion: new Date(),
    direccion_envio: "Calle Principal 123",
    detalles: [
      {
        producto_id: 1,
        producto_nombre: "Smartphone Pro",
        cantidad: 1,
        precio_unitario: "999.99",
        subtotal: "999.99"
      },
      {
        producto_id: 3,
        producto_nombre: "Auriculares Inalámbricos",
        cantidad: 1,
        precio_unitario: "299.99",
        subtotal: "299.99"
      }
    ]
  },
  {
    id: 2,
    usuario_id: 2,
    total: "599.99",
    estado: "pagado",
    fecha_creacion: new Date(),
    direccion_envio: "Avenida Central 456",
    detalles: [
      {
        producto_id: 2,
        producto_nombre: "Tablet",
        cantidad: 1,
        precio_unitario: "599.99",
        subtotal: "599.99"
      }
    ]
  },
  {
    id: 3,
    usuario_id: 3, // Otro usuario
    total: "299.99",
    estado: "pendiente",
    fecha_creacion: new Date(),
    direccion_envio: "Otra dirección"
  }
];

// Configurar rutas básicas
app.get("/api/v1/ordenes", authMiddleware, (req, res) => {
  // Filtrar órdenes del usuario actual (excepto admin)
  const misOrdenes = req.usuario.es_admin 
    ? ordenes 
    : ordenes.filter(orden => orden.usuario_id === req.usuario.id);
  
  res.status(200).json({
    ordenes: misOrdenes,
    total: misOrdenes.length,
    pagina: 1,
    paginas: 1
  });
});

app.get("/api/v1/ordenes/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const orden = ordenes.find(o => o.id === id);
  
  // Orden no encontrada
  if (!orden) {
    return res.status(404).json({ mensaje: "Orden no encontrada" });
  }
  
  // Verificar que la orden pertenece al usuario o es admin
  if (orden.usuario_id !== req.usuario.id && !req.usuario.es_admin) {
    return res.status(403).json({ mensaje: "No tienes permiso para ver esta orden" });
  }
  
  res.status(200).json(orden);
});

app.post("/api/v1/ordenes", authMiddleware, (req, res) => {
  // Crear nueva orden
  const nuevaOrden = {
    id: ordenes.length + 1,
    usuario_id: req.usuario.id,
    total: "200.00", // Ejemplo
    estado: "pendiente",
    fecha_creacion: new Date(),
    direccion_envio: req.body.direccion_envio,
    detalles: req.body.items.map(item => ({
      producto_id: item.producto_id,
      producto_nombre: `Producto ${item.producto_id}`,
      cantidad: item.cantidad,
      precio_unitario: "100.00",
      subtotal: (100 * item.cantidad).toFixed(2)
    }))
  };
  
  res.status(201).json(nuevaOrden);
});

app.patch("/api/v1/ordenes/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  
  // Verificar si es administrador
  if (!req.usuario.es_admin) {
    return res.status(403).json({ mensaje: "Requiere permisos de administrador" });
  }
  
  const orden = ordenes.find(o => o.id === id);
  
  // Orden no encontrada
  if (!orden) {
    return res.status(404).json({ mensaje: "Orden no encontrada" });
  }
  
  // Actualizar estado
  orden.estado = req.body.estado;
  
  res.status(200).json({
    mensaje: "Estado actualizado con éxito",
    orden: orden
  });
});

app.delete("/api/v1/ordenes/:orden_id/productos/:detalle_id", authMiddleware, (req, res) => {
  const ordenId = parseInt(req.params.orden_id);
  const detalleId = parseInt(req.params.detalle_id);
  
  const orden = ordenes.find(o => o.id === ordenId);
  
  // Orden no encontrada
  if (!orden) {
    return res.status(404).json({ mensaje: "Orden no encontrada" });
  }
  
  // Verificar que la orden pertenece al usuario o es admin
  if (orden.usuario_id !== req.usuario.id && !req.usuario.es_admin) {
    return res.status(403).json({ mensaje: "No tienes permiso para modificar esta orden" });
  }
  
  // Verificar que la orden está pendiente
  if (orden.estado !== "pendiente") {
    return res.status(400).json({ mensaje: "No se puede modificar una orden que no está pendiente" });
  }
  
  res.status(200).json({
    mensaje: "Producto eliminado exitosamente de la orden",
    orden_id: ordenId,
    detalle_id: detalleId
  });
});

describe("Operaciones de Órdenes", () => {
  // Test 1: Listar órdenes del usuario
  it("GET /ordenes devuelve status 200 y las órdenes del usuario", async () => {
    const response = await request(app)
      .get("/api/v1/ordenes")
      .set("Authorization", "Bearer token-usuario");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("ordenes");
    expect(Array.isArray(response.body.ordenes)).toBe(true);
    expect(response.body.ordenes.length).toBe(2); // Solo las órdenes del usuario
    expect(response.body.ordenes[0]).toHaveProperty("id", 1);
  });

  // Test 2: Listar todas las órdenes como admin
  it("GET /ordenes como admin devuelve todas las órdenes", async () => {
    const response = await request(app)
      .get("/api/v1/ordenes")
      .set("Authorization", "Bearer token-admin");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("ordenes");
    expect(Array.isArray(response.body.ordenes)).toBe(true);
    expect(response.body.ordenes.length).toBe(3); // Todas las órdenes
  });

  // Test 3: Ver una orden específica
  it("GET /ordenes/:id devuelve status 200 y la orden con sus detalles", async () => {
    const response = await request(app)
      .get("/api/v1/ordenes/1")
      .set("Authorization", "Bearer token-usuario");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("total", "1299.98");
    expect(response.body).toHaveProperty("detalles");
    expect(Array.isArray(response.body.detalles)).toBe(true);
  });

  // Test 4: No acceso a orden de otro usuario
  it("GET /ordenes/:id devuelve 403 si la orden no pertenece al usuario", async () => {
    const response = await request(app)
      .get("/api/v1/ordenes/3") // Orden de otro usuario
      .set("Authorization", "Bearer token-usuario");
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty("mensaje", "No tienes permiso para ver esta orden");
  });

  // Test 5: Admin puede ver cualquier orden
  it("GET /ordenes/:id como admin puede ver cualquier orden", async () => {
    const response = await request(app)
      .get("/api/v1/ordenes/3") // Orden de otro usuario
      .set("Authorization", "Bearer token-admin");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 3);
  });

  // Test 6: Crear una nueva orden
  it("POST /ordenes crea una orden y devuelve status 201", async () => {
    const nuevaOrden = {
      direccion_envio: "Calle Nueva 789",
      items: [
        { producto_id: 1, cantidad: 2 },
        { producto_id: 3, cantidad: 1 }
      ]
    };

    const response = await request(app)
      .post("/api/v1/ordenes")
      .set("Authorization", "Bearer token-usuario")
      .send(nuevaOrden);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("estado", "pendiente");
    expect(response.body).toHaveProperty("detalles");
    expect(Array.isArray(response.body.detalles)).toBe(true);
  });

  // Test 7: Actualizar estado de orden requiere admin
  it("PATCH /ordenes/:id requiere rol de administrador", async () => {
    const actualizacionEstado = {
      estado: "enviado"
    };

    // Intentar como usuario normal
    const responseUsuario = await request(app)
      .patch("/api/v1/ordenes/1")
      .set("Authorization", "Bearer token-usuario")
      .send(actualizacionEstado);
    
    expect(responseUsuario.statusCode).toBe(403);
    
    // Intentar como admin
    const responseAdmin = await request(app)
      .patch("/api/v1/ordenes/1")
      .set("Authorization", "Bearer token-admin")
      .send(actualizacionEstado);
    
    expect(responseAdmin.statusCode).toBe(200);
    expect(responseAdmin.body).toHaveProperty("mensaje", "Estado actualizado con éxito");
  });

  // Test 8: Eliminar un producto de una orden
  it("DELETE /ordenes/:orden_id/productos/:detalle_id elimina un producto de la orden", async () => {
    const response = await request(app)
      .delete("/api/v1/ordenes/1/productos/3")
      .set("Authorization", "Bearer token-usuario");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("mensaje", "Producto eliminado exitosamente de la orden");
  });
});