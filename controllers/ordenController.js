const db = require('../config/database');

/**
 * Listar órdenes del usuario autenticado con paginación
 * @route GET /ordenes
 */
const listarOrdenes = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { pagina = 1, limite = 10 } = req.query;
    
    // Validar parámetros de paginación
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    
    if (isNaN(paginaNum) || paginaNum < 1 || isNaN(limiteNum) || limiteNum < 1) {
      return res.status(400).json({ 
        mensaje: 'Parámetros de paginación inválidos' 
      });
    }
    
    // Contar el total de órdenes del usuario
    const countResult = await db.query(
      'SELECT COUNT(*) FROM ORDEN WHERE usuario_id = $1',
      [usuarioId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Calcular offset para paginación
    const offset = (paginaNum - 1) * limiteNum;
    
    // Obtener las órdenes paginadas
    const result = await db.query(
      `SELECT id, total, estado, fecha_creacion 
       FROM ORDEN 
       WHERE usuario_id = $1 
       ORDER BY fecha_creacion DESC 
       LIMIT $2 OFFSET $3`,
      [usuarioId, limiteNum, offset]
    );
    
    // Calcular total de páginas
    const paginas = Math.ceil(total / limiteNum);
    
    res.status(200).json({
      total,
      pagina: paginaNum,
      paginas,
      ordenes: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una orden específica con sus detalles
 * @route GET /ordenes/:id
 */
const obtenerOrdenPorId = async (req, res, next) => {
  try {
    const ordenId = req.params.id;
    const usuarioId = req.usuario.id;
    
    // Obtener la orden
    const ordenResult = await db.query(
      `SELECT id, usuario_id, total, estado, fecha_creacion, direccion_envio 
       FROM ORDEN 
       WHERE id = $1`,
      [ordenId]
    );
    
    if (ordenResult.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Orden no encontrada' 
      });
    }
    
    const orden = ordenResult.rows[0];
    
    // Verificar que la orden pertenezca al usuario o sea administrador
    if (orden.usuario_id !== usuarioId && !req.usuario.es_admin) {
      return res.status(403).json({ 
        mensaje: 'No tienes permiso para ver esta orden' 
      });
    }
    
    // Obtener los detalles de la orden
    const detallesResult = await db.query(
      `SELECT d.orden_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal,
              p.nombre as producto_nombre, p.imagen_url as producto_imagen
       FROM DETALLE_ORDEN d
       JOIN PRODUCTO p ON d.producto_id = p.id
       WHERE d.orden_id = $1`,
      [ordenId]
    );
    
    // Formatear los detalles
    const detalles = detallesResult.rows.map(detalle => ({
      producto: {
        id: detalle.producto_id,
        nombre: detalle.producto_nombre,
        precio: detalle.precio_unitario,
        imagen_url: detalle.producto_imagen
      },
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      subtotal: detalle.subtotal
    }));
    
    // Construir la respuesta
    const ordenCompleta = {
      id: orden.id,
      total: orden.total,
      estado: orden.estado,
      fecha_creacion: orden.fecha_creacion,
      direccion_envio: orden.direccion_envio,
      detalles
    };
    
    res.status(200).json(ordenCompleta);
  } catch (error) {
    next(error);
  }
};

/**
 * Crear una nueva orden
 * @route POST /ordenes
 */
const crearOrden = async (req, res, next) => {
  // Usar una transacción para asegurar la integridad de la operación
  const client = await db.pool.connect();
  
  try {
    const { direccion_envio, items } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!direccion_envio) {
      return res.status(400).json({ 
        mensaje: 'Se requiere una dirección de envío' 
      });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        mensaje: 'Se requiere al menos un producto en la orden' 
      });
    }
    
    await client.query('BEGIN');
    
    // Verificar stock y obtener precios de los productos
    const productosVerificados = [];
    let totalOrden = 0;
    
    for (const item of items) {
      const { producto_id, cantidad } = item;
      
      if (!producto_id || !cantidad || cantidad < 1) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: 'Datos de producto inválidos'
        });
      }
      
      // Obtener información del producto
      const productoResult = await client.query(
        'SELECT id, nombre, precio, stock FROM PRODUCTO WHERE id = $1',
        [producto_id]
      );
      
      if (productoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `Producto con ID ${producto_id} no encontrado`
        });
      }
      
      const producto = productoResult.rows[0];
      
      // Verificar stock
      if (producto.stock < cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock}`
        });
      }
      
      // Reducir el stock
      await client.query(
        'UPDATE PRODUCTO SET stock = stock - $1 WHERE id = $2',
        [cantidad, producto_id]
      );
      
      // Calcular subtotal
      const subtotal = parseFloat(producto.precio) * cantidad;
      totalOrden += subtotal;
      
      productosVerificados.push({
        producto_id,
        cantidad,
        precio_unitario: producto.precio,
        subtotal
      });
    }
    
    // Crear la orden
    const ordenResult = await client.query(
      `INSERT INTO ORDEN (usuario_id, total, estado, direccion_envio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, total, estado, fecha_creacion, direccion_envio`,
      [usuarioId, totalOrden, 'pendiente', direccion_envio]
    );
    
    const nuevaOrden = ordenResult.rows[0];
    
    // Crear los detalles de la orden
    for (const producto of productosVerificados) {
      await client.query(
        `INSERT INTO DETALLE_ORDEN (orden_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [nuevaOrden.id, producto.producto_id, producto.cantidad, producto.precio_unitario, producto.subtotal]
      );
    }
    
    // Obtener los detalles completos para la respuesta
    const detallesResult = await client.query(
      `SELECT d.orden_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal,
              p.nombre as producto_nombre, p.imagen_url as producto_imagen
       FROM DETALLE_ORDEN d
       JOIN PRODUCTO p ON d.producto_id = p.id
       WHERE d.orden_id = $1`,
      [nuevaOrden.id]
    );
    
    // Formatear los detalles
    const detalles = detallesResult.rows.map(detalle => ({
      producto: {
        id: detalle.producto_id,
        nombre: detalle.producto_nombre,
        precio: detalle.precio_unitario,
        imagen_url: detalle.producto_imagen
      },
      cantidad: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
      subtotal: detalle.subtotal
    }));
    
    await client.query('COMMIT');
    
    // Construir la respuesta completa
    const ordenCompleta = {
      id: nuevaOrden.id,
      total: nuevaOrden.total,
      estado: nuevaOrden.estado,
      fecha_creacion: nuevaOrden.fecha_creacion,
      direccion_envio: nuevaOrden.direccion_envio,
      detalles
    };
    
    res.status(201).json(ordenCompleta);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Actualizar el estado de una orden (solo admin)
 * @route PATCH /ordenes/:id
 */
const actualizarEstadoOrden = async (req, res, next) => {
  try {
    const ordenId = req.params.id;
    const { estado } = req.body;
    
    // Validar el estado
    const estadosValidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        mensaje: 'Estado inválido' 
      });
    }
    
    // Verificar si la orden existe
    const ordenExistente = await db.query(
      'SELECT id FROM ORDEN WHERE id = $1',
      [ordenId]
    );
    
    if (ordenExistente.rows.length === 0) {
      return res.status(404).json({ 
        mensaje: 'Orden no encontrada' 
      });
    }
    
    // Actualizar el estado
    await db.query(
      'UPDATE ORDEN SET estado = $1 WHERE id = $2',
      [estado, ordenId]
    );
    
    res.status(200).json({
      id: parseInt(ordenId),
      estado,
      mensaje: 'Estado de orden actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Añadir productos a una orden existente (estado pendiente)
 * @route POST /ordenes/:id/productos
 */
const agregarProductosOrden = async (req, res, next) => {
  // Usar una transacción para asegurar la integridad de la operación
  const client = await db.pool.connect();
  
  try {
    const ordenId = req.params.id;
    const { items } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        mensaje: 'Se requiere al menos un producto para agregar' 
      });
    }
    
    await client.query('BEGIN');
    
    // Verificar si la orden existe y está en estado pendiente
    const ordenResult = await client.query(
      'SELECT id, usuario_id, total, estado FROM ORDEN WHERE id = $1',
      [ordenId]
    );
    
    if (ordenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        mensaje: 'Orden no encontrada' 
      });
    }
    
    const orden = ordenResult.rows[0];
    
    // Verificar que la orden pertenezca al usuario
    if (orden.usuario_id !== usuarioId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        mensaje: 'No tienes permiso para modificar esta orden' 
      });
    }
    
    // Verificar que la orden esté en estado pendiente
    if (orden.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        mensaje: 'Solo se pueden modificar órdenes en estado pendiente' 
      });
    }
    
    // Verificar stock y obtener precios de los productos
    let totalAdicional = 0;
    
    for (const item of items) {
      const { producto_id, cantidad } = item;
      
      if (!producto_id || !cantidad || cantidad < 1) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: 'Datos de producto inválidos'
        });
      }
      
      // Verificar si el producto ya está en la orden
      const detalleExistente = await client.query(
        'SELECT producto_id FROM DETALLE_ORDEN WHERE orden_id = $1 AND producto_id = $2',
        [ordenId, producto_id]
      );
      
      if (detalleExistente.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `El producto con ID ${producto_id} ya está en la orden. Utilice la función de actualizar cantidad.`
        });
      }
      
      // Obtener información del producto
      const productoResult = await client.query(
        'SELECT id, nombre, precio, stock FROM PRODUCTO WHERE id = $1',
        [producto_id]
      );
      
      if (productoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `Producto con ID ${producto_id} no encontrado`
        });
      }
      
      const producto = productoResult.rows[0];
      
      // Verificar stock
      if (producto.stock < cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock}`
        });
      }
      
      // Reducir el stock
      await client.query(
        'UPDATE PRODUCTO SET stock = stock - $1 WHERE id = $2',
        [cantidad, producto_id]
      );
      
      // Calcular subtotal
      const subtotal = parseFloat(producto.precio) * cantidad;
      totalAdicional += subtotal;
      
      // Agregar el detalle a la orden
      await client.query(
        `INSERT INTO DETALLE_ORDEN (orden_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [ordenId, producto_id, cantidad, producto.precio, subtotal]
      );
    }
    
    // Actualizar el total de la orden
    const nuevoTotal = parseFloat(orden.total) + totalAdicional;
    
    await client.query(
      'UPDATE ORDEN SET total = $1 WHERE id = $2',
      [nuevoTotal, ordenId]
    );
    
    // Obtener la orden actualizada con sus detalles
    const ordenActualizada = await obtenerOrdenCompletaCliente(client, ordenId);
    
    await client.query('COMMIT');
    
    res.status(200).json(ordenActualizada);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Actualizar la cantidad de un producto en una orden
 * @route PUT /ordenes/:orden_id/productos/:detalle_id
 */
const actualizarCantidadProducto = async (req, res, next) => {
  // Usar una transacción para asegurar la integridad de la operación
  const client = await db.pool.connect();
  
  try {
    const ordenId = req.params.orden_id;
    const productoId = req.params.detalle_id;
    const { cantidad } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ 
        mensaje: 'Se requiere una cantidad válida (mayor a 0)' 
      });
    }
    
    await client.query('BEGIN');
    
    // Verificar si la orden existe y está en estado pendiente
    const ordenResult = await client.query(
      'SELECT id, usuario_id, total, estado FROM ORDEN WHERE id = $1',
      [ordenId]
    );
    
    if (ordenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        mensaje: 'Orden no encontrada' 
      });
    }
    
    const orden = ordenResult.rows[0];
    
    // Verificar que la orden pertenezca al usuario
    if (orden.usuario_id !== usuarioId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        mensaje: 'No tienes permiso para modificar esta orden' 
      });
    }
    
    // Verificar que la orden esté en estado pendiente
    if (orden.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        mensaje: 'Solo se pueden modificar órdenes en estado pendiente' 
      });
    }
    
    // Verificar si el detalle existe
    const detalleResult = await client.query(
      'SELECT producto_id, cantidad, precio_unitario FROM DETALLE_ORDEN WHERE orden_id = $1 AND producto_id = $2',
      [ordenId, productoId]
    );
    
    if (detalleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado en la orden' 
      });
    }
    
    const detalle = detalleResult.rows[0];
    const cantidadActual = detalle.cantidad;
    const diferenciaStock = cantidad - cantidadActual;
    
    // Si aumenta la cantidad, verificar stock
    if (diferenciaStock > 0) {
      // Obtener stock actual del producto
      const productoResult = await client.query(
        'SELECT nombre, stock FROM PRODUCTO WHERE id = $1',
        [productoId]
      );
      
      const producto = productoResult.rows[0];
      
      if (producto.stock < diferenciaStock) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock}`
        });
      }
      
      // Actualizar stock
      await client.query(
        'UPDATE PRODUCTO SET stock = stock - $1 WHERE id = $2',
        [diferenciaStock, productoId]
      );
    } else if (diferenciaStock < 0) {
      // Si disminuye, devolver al stock
      await client.query(
        'UPDATE PRODUCTO SET stock = stock + $1 WHERE id = $2',
        [Math.abs(diferenciaStock), productoId]
      );
    }
    
    // Calcular nuevo subtotal
    const nuevaSubtotal = parseFloat(detalle.precio_unitario) * cantidad;
    
    // Actualizar detalle de orden
    await client.query(
      'UPDATE DETALLE_ORDEN SET cantidad = $1, subtotal = $2 WHERE orden_id = $3 AND producto_id = $4',
      [cantidad, nuevaSubtotal, ordenId, productoId]
    );
    
    // Recalcular el total de la orden
    const totalResult = await client.query(
      'SELECT SUM(subtotal) as total FROM DETALLE_ORDEN WHERE orden_id = $1',
      [ordenId]
    );
    
    const nuevoTotal = totalResult.rows[0].total;
    
    // Actualizar total de la orden
    await client.query(
      'UPDATE ORDEN SET total = $1 WHERE id = $2',
      [nuevoTotal, ordenId]
    );
    
    // Obtener información actualizada del detalle para la respuesta
    const detalleActualizado = await client.query(
      `SELECT d.producto_id, d.cantidad, d.precio_unitario, d.subtotal,
              p.nombre as producto_nombre, p.imagen_url as producto_imagen
       FROM DETALLE_ORDEN d
       JOIN PRODUCTO p ON d.producto_id = p.id
       WHERE d.orden_id = $1 AND d.producto_id = $2`,
      [ordenId, productoId]
    );
    
    // Formatear la respuesta
    const respuesta = {
      producto: {
        id: detalleActualizado.rows[0].producto_id,
        nombre: detalleActualizado.rows[0].producto_nombre,
        precio: detalleActualizado.rows[0].precio_unitario,
        imagen_url: detalleActualizado.rows[0].producto_imagen
      },
      cantidad: detalleActualizado.rows[0].cantidad,
      precio_unitario: detalleActualizado.rows[0].precio_unitario,
      subtotal: detalleActualizado.rows[0].subtotal
    };
    
    await client.query('COMMIT');
    
    res.status(200).json(respuesta);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Eliminar un producto de una orden
 * @route DELETE /ordenes/:orden_id/productos/:detalle_id
 */
const eliminarProductoOrden = async (req, res, next) => {
  // Usar una transacción para asegurar la integridad de la operación
  const client = await db.pool.connect();
  
  try {
    const ordenId = req.params.orden_id;
    const productoId = req.params.detalle_id;
    const usuarioId = req.usuario.id;
    
    await client.query('BEGIN');
    
    // Verificar si la orden existe y está en estado pendiente
    const ordenResult = await client.query(
      'SELECT id, usuario_id, estado FROM ORDEN WHERE id = $1',
      [ordenId]
    );
    
    if (ordenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        mensaje: 'Orden no encontrada' 
      });
    }
    
    const orden = ordenResult.rows[0];
    
    // Verificar que la orden pertenezca al usuario
    if (orden.usuario_id !== usuarioId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        mensaje: 'No tienes permiso para modificar esta orden' 
      });
    }
    
    // Verificar que la orden esté en estado pendiente
    if (orden.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        mensaje: 'Solo se pueden modificar órdenes en estado pendiente' 
      });
    }
    
    // Verificar si el detalle existe
    const detalleResult = await client.query(
      'SELECT cantidad FROM DETALLE_ORDEN WHERE orden_id = $1 AND producto_id = $2',
      [ordenId, productoId]
    );
    
    if (detalleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        mensaje: 'Producto no encontrado en la orden' 
      });
    }
    
    const cantidadActual = detalleResult.rows[0].cantidad;
    
    // Devolver stock al producto
    await client.query(
      'UPDATE PRODUCTO SET stock = stock + $1 WHERE id = $2',
      [cantidadActual, productoId]
    );
    
    // Eliminar el detalle de la orden
    await client.query(
      'DELETE FROM DETALLE_ORDEN WHERE orden_id = $1 AND producto_id = $2',
      [ordenId, productoId]
    );
    
    // Recalcular el total de la orden
    const totalResult = await client.query(
      'SELECT SUM(subtotal) as total FROM DETALLE_ORDEN WHERE orden_id = $1',
      [ordenId]
    );
    
    const nuevoTotal = totalResult.rows[0].total || 0;
    
    // Actualizar total de la orden
    await client.query(
      'UPDATE ORDEN SET total = $1 WHERE id = $2',
      [nuevoTotal, ordenId]
    );
    
    await client.query('COMMIT');
    
    res.status(200).json({
      mensaje: 'Producto eliminado exitosamente de la orden',
      orden_id: parseInt(ordenId),
      detalle_id: parseInt(productoId)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Función auxiliar para obtener una orden completa con sus detalles
 * @param {Object} client - Cliente de base de datos para transacciones
 * @param {number} ordenId - ID de la orden
 * @returns {Object} Orden completa con detalles
 */
const obtenerOrdenCompletaCliente = async (client, ordenId) => {
  // Obtener información de la orden
  const ordenResult = await client.query(
    `SELECT id, total, estado, fecha_creacion, direccion_envio 
     FROM ORDEN 
     WHERE id = $1`,
    [ordenId]
  );
  
  const orden = ordenResult.rows[0];
  
  // Obtener detalles de la orden
  const detallesResult = await client.query(
    `SELECT d.orden_id, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal,
            p.nombre as producto_nombre, p.imagen_url as producto_imagen
     FROM DETALLE_ORDEN d
     JOIN PRODUCTO p ON d.producto_id = p.id
     WHERE d.orden_id = $1`,
    [ordenId]
  );
  
  // Formatear los detalles
  const detalles = detallesResult.rows.map(detalle => ({
    producto: {
      id: detalle.producto_id,
      nombre: detalle.producto_nombre,
      precio: detalle.precio_unitario,
      imagen_url: detalle.producto_imagen
    },
    cantidad: detalle.cantidad,
    precio_unitario: detalle.precio_unitario,
    subtotal: detalle.subtotal
  }));
  
  return {
    id: orden.id,
    total: orden.total,
    estado: orden.estado,
    fecha_creacion: orden.fecha_creacion,
    direccion_envio: orden.direccion_envio,
    detalles
  };
};

module.exports = {
  listarOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarEstadoOrden,
  agregarProductosOrden,
  actualizarCantidadProducto,
  eliminarProductoOrden
};