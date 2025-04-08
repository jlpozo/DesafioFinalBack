const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuarioRoutes = require('./usuario.routes');
const categoriaRoutes = require('./categoria.routes');
const productoRoutes = require('./producto.routes');
const ordenRoutes = require('./orden.routes');

// Definir los prefijos para cada módulo de rutas
router.use('/usuarios', usuarioRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/ordenes', ordenRoutes);

module.exports = router;