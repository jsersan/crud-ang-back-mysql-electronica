const sql = require('./db');

const Producto = function(producto) {
  this.nombre = producto.nombre;
  this.descripcion = producto.descripcion;
  this.precio = producto.precio;
  this.stock = producto.stock;
};

Producto.create = (newProducto, result) => {
  sql.query('INSERT INTO productos SET ?', newProducto, (err, res) => {
    if (err) {
      console.log('error:', err);
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newProducto });
  });
};

Producto.findById = (id, result) => {
  sql.query('SELECT * FROM productos WHERE id = ?', id, (err, res) => {
    if (err) {
      console.log('error:', err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    result({ kind: 'not_found' }, null);
  });
};

Producto.getAll = (nombre, result) => {
  let query = 'SELECT * FROM productos';
  if (nombre) {
    query += ' WHERE nombre LIKE ?';
    sql.query(query, [`%${nombre}%`], (err, res) => {
      if (err) {
        console.log('error:', err);
        result(err, null);
        return;
      }
      result(null, res);
    });
  } else {
    sql.query(query, (err, res) => {
      if (err) {
        console.log('error:', err);
        result(err, null);
        return;
      }
      result(null, res);
    });
  }
};

Producto.updateById = (id, producto, result) => {
  sql.query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?',
    [producto.nombre, producto.descripcion, producto.precio, producto.stock, id],
    (err, res) => {
      if (err) {
        console.log('error:', err);
        result(err, null);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: 'not_found' }, null);
        return;
      }
      result(null, { id: id, ...producto });
    }
  );
};

Producto.remove = (id, result) => {
  sql.query('DELETE FROM productos WHERE id = ?', id, (err, res) => {
    if (err) {
      console.log('error:', err);
      result(err, null);
      return;
    }
    if (res.affectedRows == 0) {
      result({ kind: 'not_found' }, null);
      return;
    }
    result(null, res);
  });
};

Producto.removeAll = result => {
  sql.query('DELETE FROM productos', (err, res) => {
    if (err) {
      console.log('error:', err);
      result(err, null);
      return;
    }
    result(null, res);
  });
};

module.exports = Producto;

