const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../config/jwt');

/**
 * Registrar un nuevo usuario
 * @route POST /usuarios/registro
 */
const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono } = req.body;
    
    // Verificar si el email ya está registrado
    const usuarioExistente = await db.query(
      'SELECT id FROM USUARIO WHERE email = $1',
      [email]
    );
    
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ 
        mensaje: 'El email ya está registrado' 
      });
    }
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar el nuevo usuario
    const result = await db.query(
      `INSERT INTO USUARIO (nombre, email, password, telefono, es_admin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, telefono, es_admin, fecha_registro`,
      [nombre, email, hashedPassword, telefono || null, false]
    );
    
    const nuevoUsuario = result.rows[0];
    
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar sesión de usuario
 * @route POST /usuarios/login
 */
const loginUsuario = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const result = await db.query(
      'SELECT id, nombre, email, password, es_admin FROM USUARIO WHERE email = $1',
      [email]
    );
    
    const usuario = result.rows[0];
    
    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        mensaje: 'Credenciales inválidas' 
      });
    }
    
    // Generar token JWT
    const usuarioBasico = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      es_admin: usuario.es_admin
    };
    
    const token = generateToken(usuarioBasico);
    
    res.status(200).json({
      token,
      usuario: usuarioBasico
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario autenticado
 * @route GET /usuarios/perfil
 */
const obtenerPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    
    const result = await db.query(
      `SELECT id, nombre, email, telefono, es_admin, fecha_registro 
       FROM USUARIO 
       WHERE id = $1`,
      [usuarioId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Usuario no encontrado' 
      });
    }
    
    const perfil = result.rows[0];
    res.status(200).json(perfil);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar perfil del usuario autenticado
 * @route PUT /usuarios/perfil
 */
const actualizarPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, telefono, password } = req.body;
    
    // Verificar si el usuario existe
    const usuario = await db.query(
      'SELECT * FROM USUARIO WHERE id = $1',
      [usuarioId]
    );
    
    if (usuario.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Usuario no encontrado' 
      });
    }
    
    // Preparar los campos a actualizar
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    // Actualizar solo los campos proporcionados
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    if (nombre) {
      fields.push(`nombre = $${paramCounter}`);
      values.push(nombre);
      paramCounter++;
    }
    
    if (telefono !== undefined) {
      fields.push(`telefono = $${paramCounter}`);
      values.push(telefono);
      paramCounter++;
    }
    
    if (hashedPassword) {
      fields.push(`password = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }
    
    // Si no hay campos para actualizar
    if (fields.length === 0) {
      return res.status(400).json({ 
        mensaje: 'No se proporcionaron campos para actualizar' 
      });
    }
    
    // Agregar el ID del usuario al final de los valores
    values.push(usuarioId);
    
    // Ejecutar la actualización
    const result = await db.query(
      `UPDATE USUARIO 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCounter} 
       RETURNING id, nombre, email, telefono, es_admin, fecha_registro`,
      values
    );
    
    const perfilActualizado = result.rows[0];
    res.status(200).json(perfilActualizado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil
};