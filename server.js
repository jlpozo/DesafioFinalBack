const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de DesafioMKP funcionando correctamente',
    version: '1.0.0'
  });
});

// Rutas de la API
app.use('/api/v1', routes);

// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejador global de errores
app.use(errorHandler);

// Puerto para el servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
});

// Exportar la app para pruebas
module.exports = app;