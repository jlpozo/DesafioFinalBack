const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  loginUsuario, 
  obtenerPerfil, 
  actualizarPerfil 
} = require('../controllers/usuarioController');
const { authenticate } = require('../middlewares/auth');
const { 
  validateRequiredFields, 
  validateEmail 
} = require('../middlewares/validation');

// Ruta para registrar un nuevo usuario
router.post(
  '/registro', 
  validateRequiredFields(['nombre', 'email', 'password']),
  validateEmail,
  registrarUsuario
);

// Ruta para iniciar sesión
router.post(
  '/login', 
  validateRequiredFields(['email', 'password']),
  validateEmail,
  loginUsuario
);

// Rutas protegidas que requieren autenticación
router.get('/perfil', authenticate, obtenerPerfil);
router.put('/perfil', authenticate, actualizarPerfil);

module.exports = router;