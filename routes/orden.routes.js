const express = require('express');
const router = express.Router();
const { 
  listarOrdenes, 
  obtenerOrdenPorId, 
  crearOrden, 
  actualizarEstadoOrden, 
  agregarProductosOrden, 
  actualizarCantidadProducto, 
  eliminarProductoOrden 
} = require('../controllers/ordenController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/admin');
const { 
  validateRequiredFields, 
  validatePositiveNumber 
} = require('../middlewares/validation');

// Todas las rutas de órdenes requieren autenticación
router.use(authenticate);

// Listar órdenes del usuario y crear nueva orden
router.get('/', listarOrdenes);
router.post(
  '/',
  validateRequiredFields(['direccion_envio', 'items']),
  crearOrden
);

// Obtener orden específica
router.get('/:id', obtenerOrdenPorId);

// Actualizar estado de orden (solo admin)
router.patch(
  '/:id',
  isAdmin,
  validateRequiredFields(['estado']),
  actualizarEstadoOrden
);

// Añadir productos a una orden existente
router.post(
  '/:id/productos',
  validateRequiredFields(['items']),
  agregarProductosOrden
);

// Actualizar cantidad de un producto en una orden
router.put(
  '/:orden_id/productos/:detalle_id',
  validateRequiredFields(['cantidad']),
  validatePositiveNumber('cantidad'),
  actualizarCantidadProducto
);

// Eliminar un producto de una orden
router.delete(
  '/:orden_id/productos/:detalle_id',
  eliminarProductoOrden
);

module.exports = router;