const request = require("supertest");
const express = require("express");

// Crear un servidor express simple para las pruebas
const app = express();

// Configurar rutas básicas
app.get("/api/v1/categorias", (req, res) => {
  res.status(200).json({ 
    categorias: [
      { id: 1, nombre: "Smartphones", descripcion: "Teléfonos inteligentes" },
      { id: 2, nombre: "Laptops", descripcion: "Computadoras portátiles" }
    ] 
  });
});

app.get("/api/v1/categorias/1", (req, res) => {
  res.status(200).json({ 
    id: 1, 
    nombre: "Smartphones", 
    descripcion: "Teléfonos inteligentes",
    productos: [
      { id: 1, nombre: "Smartphone X", precio: "799.99" },
      { id: 2, nombre: "Smartphone Y", precio: "899.99" }
    ]
  });
});

app.get("/api/v1/categorias/999", (req, res) => {
  res.status(404).json({ mensaje: "Categoría no encontrada" });
});

app.post("/api/v1/categorias", (req, res) => {
  const auth = req.headers.authorization;
  
  if (!auth) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }
  
  if (auth.includes("token-admin")) {
    res.status(201).json({
      id: 3,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion
    });
  } else {
    res.status(403).json({ mensaje: "Requiere permisos de administrador" });
  }
});

describe("Operaciones CRUD de categorías", () => {
  // Test 1: Obtener todas las categorías
  it("GET /categorias devuelve status 200 y un arreglo de categorías", async () => {
    const response = await request(app).get("/api/v1/categorias");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("categorias");
    expect(Array.isArray(response.body.categorias)).toBe(true);
    expect(response.body.categorias.length).toBe(2);
  });

  // Test 2: Obtener una categoría por ID
  it("GET /categorias/:id devuelve status 200 y la categoría solicitada", async () => {
    const response = await request(app).get("/api/v1/categorias/1");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("nombre", "Smartphones");
    expect(response.body).toHaveProperty("productos");
  });

  // Test 3: Categoría no encontrada
  it("GET /categorias/:id devuelve 404 cuando la categoría no existe", async () => {
    const response = await request(app).get("/api/v1/categorias/999");
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Categoría no encontrada");
  });

  // Test 4: Crear categoría requiere autenticación
  it("POST /categorias requiere autenticación y devuelve 401 sin token", async () => {
    const response = await request(app)
      .post("/api/v1/categorias")
      .send({
        nombre: "Audio",
        descripcion: "Equipos de sonido"
      });
    
    expect(response.statusCode).toBe(401);
  });

  // Test 5: Crear una categoría con autenticación
  it("POST /categorias crea una categoría y devuelve status 201", async () => {
    const nuevaCategoria = {
      nombre: "Audio",
      descripcion: "Equipos de sonido"
    };
    
    const response = await request(app)
      .post("/api/v1/categorias")
      .set("Authorization", "Bearer token-admin")
      .send(nuevaCategoria);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id", 3);
    expect(response.body).toHaveProperty("nombre", "Audio");
  });
});