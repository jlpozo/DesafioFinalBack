/**
 * Middleware para verificar si el usuario es administrador
 * Se debe usar después del middleware de autenticación
 */
const isAdmin = (req, res, next) => {
    // Verificar si el usuario está autenticado y es admin
    if (!req.usuario || !req.usuario.es_admin) {
      return res.status(403).json({ 
        mensaje: 'Acceso denegado - Se requiere rol de administrador' 
      });
    }
    
    // El usuario es administrador, permitir acceso
    next();
  };
  
  module.exports = {
    isAdmin
  };