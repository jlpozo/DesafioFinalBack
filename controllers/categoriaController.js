const db = require('../config/database');

/**
 * Listar todas las categorías
 * @route GET /categorias
 */
const listarCategorias = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, nombre, descripcion FROM CATEGORIA ORDER BY id'
    );
    
    res.status(200).json({
      categorias: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una categoría por ID con sus productos
 * @route GET /categorias/:id
 */
const obtenerCategoriaPorId = async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    
    // Obtener la información de la categoría
    const categoriaResult = await db.query(
      'SELECT id, nombre, descripcion FROM CATEGORIA WHERE id = $1',
      [categoriaId]
    );
    
    if (categoriaResult.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Categoría no encontrada' 
      });
    }
    
    const categoria = categoriaResult.rows[0];
    
    // Obtener los productos asociados a la categoría
    const productosResult = await db.query(
      `SELECT id, nombre, precio, imagen_url 
       FROM PRODUCTO 
       WHERE categoria_id = $1`,
      [categoriaId]
    );
    
    // Construir la respuesta con el formato esperado
    const categoriaConProductos = {
      ...categoria,
      productos: productosResult.rows
    };
    
    res.status(200).json(categoriaConProductos);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva categoría (solo admin)
 * @route POST /categorias
 */
const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    
    const result = await db.query(
      `INSERT INTO CATEGORIA (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING id, nombre, descripcion`,
      [nombre, descripcion || null]
    );
    
    const nuevaCategoria = result.rows[0];
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una categoría existente (solo admin)
 * @route PUT /categorias/:id
 */
const actualizarCategoria = async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    const { nombre, descripcion } = req.body;
    
    // Verificar si la categoría existe
    const categoriaExistente = await db.query(
      'SELECT id FROM CATEGORIA WHERE id = $1',
      [categoriaId]
    );
    
    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Categoría no encontrada' 
      });
    }
    
    // Preparar los campos a actualizar
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    if (nombre) {
      fields.push(`nombre = $${paramCounter}`);
      values.push(nombre);
      paramCounter++;
    }
    
    if (descripcion !== undefined) {
      fields.push(`descripcion = $${paramCounter}`);
      values.push(descripcion);
      paramCounter++;
    }
    
    // Si no hay campos para actualizar
    if (fields.length === 0) {
      return res.status(400).json({ 
        mensaje: 'No se proporcionaron campos para actualizar' 
      });
    }
    
    // Agregar el ID de la categoría al final de los valores
    values.push(categoriaId);
    
    // Ejecutar la actualización
    const result = await db.query(
      `UPDATE CATEGORIA 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCounter} 
       RETURNING id, nombre, descripcion`,
      values
    );
    
    const categoriaActualizada = result.rows[0];
    res.status(200).json(categoriaActualizada);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una categoría (solo admin)
 * @route DELETE /categorias/:id
 */
const eliminarCategoria = async (req, res, next) => {
  try {
    const categoriaId = req.params.id;
    
    // Verificar si la categoría existe
    const categoriaExistente = await db.query(
      'SELECT id FROM CATEGORIA WHERE id = $1',
      [categoriaId]
    );
    
    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Categoría no encontrada' 
      });
    }
    
    // Verificar si hay productos asociados
    const productosAsociados = await db.query(
      'SELECT COUNT(*) FROM PRODUCTO WHERE categoria_id = $1',
      [categoriaId]
    );
    
    if (parseInt(productosAsociados.rows[0].count) > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }
    
    // Eliminar la categoría
    await db.query(
      'DELETE FROM CATEGORIA WHERE id = $1',
      [categoriaId]
    );
    
    res.status(200).json({
      mensaje: 'Categoría eliminada exitosamente',
      id: parseInt(categoriaId)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};