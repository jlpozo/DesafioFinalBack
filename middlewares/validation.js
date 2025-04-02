/**
 * Middleware para validar campos requeridos en el body del request
 * @param {Array} fields - Lista de campos a validar
 * @returns {Function} Middleware de Express
 */
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
      const missingFields = fields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: {
            mensaje: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
            codigo: 400
          }
        });
      }
      
      next();
    };
  };
  
  /**
   * Validación de email
   * @param {string} email - Email a validar
   * @returns {boolean} true si es válido, false si no
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Middleware para validar formato de email
   */
  const validateEmail = (req, res, next) => {
    const { email } = req.body;
    
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        error: {
          mensaje: 'Formato de email inválido',
          codigo: 400
        }
      });
    }
    
    next();
  };
  
  /**
   * Validar que el valor sea numérico y positivo
   * @param {string} field - Nombre del campo a validar
   */
  const validatePositiveNumber = (field) => {
    return (req, res, next) => {
      const value = req.body[field];
      
      if (value !== undefined) {
        const num = Number(value);
        
        if (isNaN(num) || num <= 0) {
          return res.status(400).json({
            error: {
              mensaje: `El campo ${field} debe ser un número positivo`,
              codigo: 400
            }
          });
        }
      }
      
      next();
    };
  };
  
  module.exports = {
    validateRequiredFields,
    validateEmail,
    validatePositiveNumber
  };