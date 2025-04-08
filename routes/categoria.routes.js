const express = require('express');
const router = express.Router();
const { 
  listarCategorias, 
  obtenerCategoriaPorId, 
  crearCategoria, 
  actualizarCategoria, 
  eliminarCategoria 
} = require('../controllers/categoriaController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');
const { validateRequiredFields } = require('../middlewares/validation');

// Rutas públicas
router.get('/', listarCategorias);
router.get('/:id', obtenerCategoriaPorId);

// Rutas protegidas que requieren rol de administrador
router.post(
  '/',
  authenticate,
  isAdmin,
  validateRequiredFields(['nombre']),
  crearCategoria
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  actualizarCategoria
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  eliminarCategoria
);

module.exports = router;