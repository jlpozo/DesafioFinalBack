const express = require('express');
const router = express.Router();
const { 
  listarProductos, 
  obtenerProductoPorId, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto,
  obtenerProductosPorCategoria
} = require('../controllers/productoController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');
const { 
  validateRequiredFields, 
  validatePositiveNumber 
} = require('../middlewares/validation');

// Rutas públicas
router.get('/', listarProductos);
router.get('/categoria/:idCategoria', obtenerProductosPorCategoria);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas que requieren rol de administrador
router.post(
  '/',
  authenticate,
  isAdmin,
  validateRequiredFields(['nombre', 'precio', 'categoria_id']),
  validatePositiveNumber('precio'),
  validatePositiveNumber('stock'),
  crearProducto
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  validatePositiveNumber('precio'),
  validatePositiveNumber('stock'),
  actualizarProducto
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  eliminarProducto
);

module.exports = router;