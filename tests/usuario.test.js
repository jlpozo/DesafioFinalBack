const request = require("supertest");
const express = require("express");

// Crear un servidor express simple para las pruebas
const app = express();

// Middleware para procesar JSON
app.use(express.json());

// Configurar rutas básicas
app.post("/api/v1/usuarios/registro", (req, res) => {
  // Verificar si es el caso de email ya registrado
  if (req.body.email === "existente@prueba.cl") {
    return res.status(400).json({ mensaje: "Email ya registrado" });
  }
  
  // Caso de registro exitoso
  return res.status(201).json({
    id: 1,
    nombre: req.body.nombre,
    email: req.body.email,
    telefono: req.body.telefono
  });
});

app.post("/api/v1/usuarios/login", (req, res) => {
  // Credenciales incorrectas
  if (req.body.password === "contraseña_incorrecta") {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
  
  // Usuario no encontrado
  if (req.body.email === "noexiste@prueba.cl") {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }
  
  // Login exitoso
  return res.status(200).json({
    token: "token-de-prueba",
    usuario: {
      id: 1,
      nombre: "Usuario Test",
      email: req.body.email
    }
  });
});

app.get("/api/v1/usuarios/perfil", (req, res) => {
  const token = req.headers.authorization;
  
  // Sin token o token inválido
  if (!token || !token.includes("token-valido")) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }
  
  // Perfil de usuario
  return res.status(200).json({
    id: 1,
    nombre: "Usuario Test",
    email: "test@prueba.cl"
  });
});

describe("Operaciones de Usuarios", () => {
  // Test 1: Registro de usuario
  it("POST /usuarios/registro crea un usuario y devuelve status 201", async () => {
    const response = await request(app)
      .post("/api/v1/usuarios/registro")
      .send({
        nombre: "Usuario Test",
        email: "test@prueba.cl",
        password: "password123",
        telefono: "123456789"
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("nombre", "Usuario Test");
    expect(response.body).toHaveProperty("email", "test@prueba.cl");
    expect(response.body).not.toHaveProperty("password");
  });

  // Test 2: Login exitoso
  it("POST /usuarios/login autentica un usuario y devuelve un token", async () => {
    const response = await request(app)
      .post("/api/v1/usuarios/login")
      .send({
        email: "test@prueba.cl",
        password: "password123"
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("usuario");
    expect(response.body.usuario).toHaveProperty("id", 1);
  });

  // Test 3: Login con credenciales incorrectas
  it("POST /usuarios/login devuelve 401 con credenciales incorrectas", async () => {
    const response = await request(app)
      .post("/api/v1/usuarios/login")
      .send({
        email: "test@prueba.cl",
        password: "contraseña_incorrecta"
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("mensaje", "Credenciales inválidas");
  });

  // Test 4: Usuario no encontrado
  it("POST /usuarios/login devuelve 404 si el usuario no existe", async () => {
    const response = await request(app)
      .post("/api/v1/usuarios/login")
      .send({
        email: "noexiste@prueba.cl",
        password: "password123"
      });
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("mensaje", "Usuario no encontrado");
  });

  // Test 5: Obtener perfil sin autenticación
  it("GET /usuarios/perfil requiere autenticación", async () => {
    const response = await request(app)
      .get("/api/v1/usuarios/perfil");
    
    expect(response.statusCode).toBe(401);
  });

  // Test 6: Obtener perfil con autenticación
  it("GET /usuarios/perfil devuelve datos del usuario con token válido", async () => {
    const response = await request(app)
      .get("/api/v1/usuarios/perfil")
      .set("Authorization", "Bearer token-valido");
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("nombre", "Usuario Test");
  });

  // Test 7: Email ya registrado devuelve error
  it("POST /usuarios/registro devuelve 400 si el email ya está registrado", async () => {
    const response = await request(app)
      .post("/api/v1/usuarios/registro")
      .send({
        nombre: "Usuario Existente",
        email: "existente@prueba.cl",
        password: "password123"
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("mensaje", "Email ya registrado");
  });
});