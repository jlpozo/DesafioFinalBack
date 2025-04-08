const { verifyToken } = require('../config/jwt');

/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado mediante token JWT
 */
const authenticate = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: 'Se requiere autenticación' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }

    // Añadir los datos del usuario al request
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ mensaje: 'Error de autenticación' });
  }
};

module.exports = {
  authenticate
};