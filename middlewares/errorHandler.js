/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const mensaje = err.message || 'Error interno del servidor';
    
    res.status(statusCode).json({
      error: {
        mensaje,
        codigo: statusCode,
        timestamp: new Date().toISOString()
      }
    });
  };
  
  /**
   * Middleware para capturar rutas no encontradas
   */
  const notFoundHandler = (req, res, next) => {
    res.status(404).json({
      error: {
        mensaje: `Ruta no encontrada: ${req.originalUrl}`,
        codigo: 404,
        timestamp: new Date().toISOString()
      }
    });
  };
  
  module.exports = {
    errorHandler,
    notFoundHandler
  };