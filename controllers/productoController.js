const db = require('../config/database');
const format = require('pg-format');

/**
 * Listar productos con paginación y filtros
 * @route GET /productos
 */
const listarProductos = async (req, res, next) => {
  try {
    const { pagina = 1, limite = 10, categoria_id, busqueda } = req.query;
    
    // Validar parámetros de paginación
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    
    if (isNaN(paginaNum) || paginaNum < 1 || isNaN(limiteNum) || limiteNum < 1) {
      return res.status(400).json({ 
        mensaje: 'Parámetros de paginación inválidos' 
      });
    }
    
    // Construir la consulta base
    let query = `
      SELECT p.id, p.nombre, p.precio, p.marca, p.descripcion, p.caracteristicas, 
             p.stock, p.imagen_url, p.fecha_creacion, 
             c.id as categoria_id, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion
      FROM PRODUCTO p
      JOIN CATEGORIA c ON p.categoria_id = c.id
    `;
    
    // Agregar condiciones de filtrado
    const whereConditions = [];
    const queryParams = [];
    let paramCounter = 1;
    
    if (categoria_id) {
      whereConditions.push(`p.categoria_id = $${paramCounter}`);
      queryParams.push(categoria_id);
      paramCounter++;
    }
    
    if (busqueda) {
      whereConditions.push(`(
        p.nombre ILIKE $${paramCounter} OR 
        p.descripcion ILIKE $${paramCounter} OR
        p.marca ILIKE $${paramCounter}
      )`);
      queryParams.push(`%${busqueda}%`);
      paramCounter++;
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Contar el total de productos con estos filtros
    const countQuery = `
      SELECT COUNT(*) FROM PRODUCTO p
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    `;
    
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Calcular offset para paginación
    const offset = (paginaNum - 1) * limiteNum;
    
    // Completar la consulta con orden y paginación
    query += `
      ORDER BY p.nombre
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    queryParams.push(limiteNum, offset);
    
    // Ejecutar la consulta paginada
    const result = await db.query(query, queryParams);
    
    // Formatear los resultados
    const productos = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      precio: row.precio,
      marca: row.marca,
      descripcion: row.descripcion,
      caracteristicas: row.caracteristicas,
      stock: row.stock,
      imagen_url: row.imagen_url,
      fecha_creacion: row.fecha_creacion,
      categoria: {
        id: row.categoria_id,
        nombre: row.categoria_nombre,
        descripcion: row.categoria_descripcion
      }
    }));
    
    // Calcular total de páginas
    const paginas = Math.ceil(total / limiteNum);
    
    res.status(200).json({
      total,
      pagina: paginaNum,
      paginas,
      productos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un producto por ID
 * @route GET /productos/:id
 */
const obtenerProductoPorId = async (req, res, next) => {
  try {
    const productoId = req.params.id;
    
    const query = `
      SELECT p.id, p.nombre, p.precio, p.marca, p.descripcion, p.caracteristicas, 
             p.stock, p.imagen_url, p.fecha_creacion, 
             c.id as categoria_id, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion
      FROM PRODUCTO p
      JOIN CATEGORIA c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [productoId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado' 
      });
    }
    
    const row = result.rows[0];
    
    // Formatear la respuesta
    const producto = {
      id: row.id,
      nombre: row.nombre,
      precio: row.precio,
      marca: row.marca,
      descripcion: row.descripcion,
      caracteristicas: row.caracteristicas,
      stock: row.stock,
      imagen_url: row.imagen_url,
      fecha_creacion: row.fecha_creacion,
      categoria: {
        id: row.categoria_id,
        nombre: row.categoria_nombre,
        descripcion: row.categoria_descripcion
      }
    };
    
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo producto (solo admin)
 * @route POST /productos
 */
const crearProducto = async (req, res, next) => {
  try {
    const { 
      nombre, 
      precio, 
      marca, 
      descripcion, 
      caracteristicas, 
      stock, 
      imagen_url, 
      categoria_id 
    } = req.body;
    
    // Verificar si la categoría existe
    const categoriaResult = await db.query(
      'SELECT id FROM CATEGORIA WHERE id = $1',
      [categoria_id]
    );
    
    if (categoriaResult.rows.length === 0) {
      return res.status(400).json({ 
        mensaje: 'La categoría especificada no existe' 
      });
    }
    
    // Insertar el nuevo producto
    const insertQuery = `
      INSERT INTO PRODUCTO (
        nombre, precio, marca, descripcion, caracteristicas, 
        stock, imagen_url, categoria_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const insertResult = await db.query(insertQuery, [
      nombre,
      precio,
      marca || null,
      descripcion || null,
      caracteristicas || null,
      stock || 0,
      imagen_url || null,
      categoria_id
    ]);
    
    const nuevoProductoId = insertResult.rows[0].id;
    
    // Obtener el producto completo con su categoría
    const productoResult = await obtenerProductoCompleto(nuevoProductoId);
    
    res.status(201).json(productoResult);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un producto existente (solo admin)
 * @route PUT /productos/:id
 */
const actualizarProducto = async (req, res, next) => {
  try {
    const productoId = req.params.id;
    const { 
      nombre, 
      precio, 
      marca, 
      descripcion, 
      caracteristicas, 
      stock, 
      imagen_url, 
      categoria_id 
    } = req.body;
    
    // Verificar si el producto existe
    const productoExistente = await db.query(
      'SELECT id FROM PRODUCTO WHERE id = $1',
      [productoId]
    );
    
    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado' 
      });
    }
    
    // Verificar la categoría si se proporciona
    if (categoria_id) {
      const categoriaExistente = await db.query(
        'SELECT id FROM CATEGORIA WHERE id = $1',
        [categoria_id]
      );
      
      if (categoriaExistente.rows.length === 0) {
        return res.status(400).json({ 
          mensaje: 'La categoría especificada no existe' 
        });
      }
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
    
    if (precio !== undefined) {
      fields.push(`precio = $${paramCounter}`);
      values.push(precio);
      paramCounter++;
    }
    
    if (marca !== undefined) {
      fields.push(`marca = $${paramCounter}`);
      values.push(marca);
      paramCounter++;
    }
    
    if (descripcion !== undefined) {
      fields.push(`descripcion = $${paramCounter}`);
      values.push(descripcion);
      paramCounter++;
    }
    
    if (caracteristicas !== undefined) {
      fields.push(`caracteristicas = $${paramCounter}`);
      values.push(caracteristicas);
      paramCounter++;
    }
    
    if (stock !== undefined) {
      fields.push(`stock = $${paramCounter}`);
      values.push(stock);
      paramCounter++;
    }
    
    if (imagen_url !== undefined) {
      fields.push(`imagen_url = $${paramCounter}`);
      values.push(imagen_url);
      paramCounter++;
    }
    
    if (categoria_id) {
      fields.push(`categoria_id = $${paramCounter}`);
      values.push(categoria_id);
      paramCounter++;
    }
    
    // Si no hay campos para actualizar
    if (fields.length === 0) {
      return res.status(400).json({ 
        mensaje: 'No se proporcionaron campos para actualizar' 
      });
    }
    
    // Agregar el ID del producto al final de los valores
    values.push(productoId);
    
    // Ejecutar la actualización
    const updateQuery = `
      UPDATE PRODUCTO 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCounter}
    `;
    
    await db.query(updateQuery, values);
    
    // Obtener el producto actualizado
    const productoActualizado = await obtenerProductoCompleto(productoId);
    
    res.status(200).json(productoActualizado);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un producto (solo admin)
 * @route DELETE /productos/:id
 */
const eliminarProducto = async (req, res, next) => {
  try {
    const productoId = req.params.id;
    
    // Verificar si el producto existe
    const productoExistente = await db.query(
      'SELECT id FROM PRODUCTO WHERE id = $1',
      [productoId]
    );
    
    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado' 
      });
    }
    
    // Verificar si el producto está asociado a alguna orden
    const ordenesAsociadas = await db.query(
      'SELECT COUNT(*) FROM DETALLE_ORDEN WHERE producto_id = $1',
      [productoId]
    );
    
    if (parseInt(ordenesAsociadas.rows[0].count) > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar el producto porque está asociado a órdenes existentes' 
      });
    }
    
    // Eliminar el producto
    await db.query(
      'DELETE FROM PRODUCTO WHERE id = $1',
      [productoId]
    );
    
    res.status(200).json({
      mensaje: 'Producto eliminado exitosamente',
      id: parseInt(productoId)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Función auxiliar para obtener un producto completo con su categoría
 * @param {number} productoId - ID del producto
 * @returns {Object} Producto con detalles de categoría
 */
const obtenerProductoCompleto = async (productoId) => {
  const query = `
    SELECT p.id, p.nombre, p.precio, p.marca, p.descripcion, p.caracteristicas, 
           p.stock, p.imagen_url, p.fecha_creacion, 
           c.id as categoria_id, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion
    FROM PRODUCTO p
    JOIN CATEGORIA c ON p.categoria_id = c.id
    WHERE p.id = $1
  `;
  
  const result = await db.query(query, [productoId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    marca: row.marca,
    descripcion: row.descripcion,
    caracteristicas: row.caracteristicas,
    stock: row.stock,
    imagen_url: row.imagen_url,
    fecha_creacion: row.fecha_creacion,
    categoria: {
      id: row.categoria_id,
      nombre: row.categoria_nombre,
      descripcion: row.categoria_descripcion
    }
  };
};

/**
 * Obtener productos por categoría
 * @route GET /productos/categoria/:idCategoria
 */
const obtenerProductosPorCategoria = async (req, res, next) => {
  try {
    const categoriaId = req.params.idCategoria;
    const { pagina = 1, limite = 10 } = req.query;
    
    // Validar parámetros de paginación
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    
    if (isNaN(paginaNum) || paginaNum < 1 || isNaN(limiteNum) || limiteNum < 1) {
      return res.status(400).json({ 
        mensaje: 'Parámetros de paginación inválidos' 
      });
    }
    
    // Verificar que la categoría existe
    const categoriaExiste = await db.query(
      'SELECT id FROM CATEGORIA WHERE id = $1',
      [categoriaId]
    );
    
    if (categoriaExiste.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Categoría no encontrada' 
      });
    }
    
    // Contar el total de productos en la categoría
    const countResult = await db.query(
      'SELECT COUNT(*) FROM PRODUCTO WHERE categoria_id = $1',
      [categoriaId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Calcular offset para paginación
    const offset = (paginaNum - 1) * limiteNum;
    
    // Obtener los productos de la categoría con paginación
    const result = await db.query(
      `SELECT p.id, p.nombre, p.precio, p.marca, p.descripcion, p.caracteristicas, 
              p.stock, p.imagen_url, p.fecha_creacion, 
              c.id as categoria_id, c.nombre as categoria_nombre, c.descripcion as categoria_descripcion
       FROM PRODUCTO p
       JOIN CATEGORIA c ON p.categoria_id = c.id
       WHERE p.categoria_id = $1
       ORDER BY p.nombre
       LIMIT $2 OFFSET $3`,
      [categoriaId, limiteNum, offset]
    );
    
    // Formatear los resultados
    const productos = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      precio: row.precio,
      marca: row.marca,
      descripcion: row.descripcion,
      caracteristicas: row.caracteristicas,
      stock: row.stock,
      imagen_url: row.imagen_url,
      fecha_creacion: row.fecha_creacion,
      categoria: {
        id: row.categoria_id,
        nombre: row.categoria_nombre,
        descripcion: row.categoria_descripcion
      }
    }));
    
    // Calcular total de páginas
    const paginas = Math.ceil(total / limiteNum);
    
    res.status(200).json({
      categoria_id: parseInt(categoriaId),
      total,
      pagina: paginaNum,
      paginas,
      productos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosPorCategoria
};