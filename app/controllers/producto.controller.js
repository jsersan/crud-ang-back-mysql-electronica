// controllers/producto.controller.js

const Producto = require('../models/producto.model.js');

// Crear y guardar un nuevo producto
exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "El contenido no puede estar vacío!" });
    return;
  }
  const producto = new Producto(req.body);

  Producto.create(producto, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Ocurrió un error al crear el producto." });
    else
      res.send(data);
  });
};

// Listar todos los productos (filtro por nombre opcional)
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  Producto.getAll(nombre, (err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Ocurrió un error al obtener los productos." });
    else
      res.send(data);
  });
};

// Buscar producto por ID
exports.findOne = (req, res) => {
  Producto.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `No se encontró producto con id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "Error al recuperar producto con id " + req.params.id });
      }
    } else {
      res.send(data);
    }
  });
};

// Actualizar producto por ID
exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "El contenido no puede estar vacío!" });
    return;
  }
  Producto.updateById(
    req.params.id,
    new Producto(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({ message: `No se encontró producto con id ${req.params.id}.` });
        } else {
          res.status(500).send({ message: "Error al actualizar producto con id " + req.params.id });
        }
      } else res.send(data);
    }
  );
};

// Eliminar producto por ID
exports.delete = (req, res) => {
  Producto.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({ message: `No se encontró producto con id ${req.params.id}.` });
      } else {
        res.status(500).send({ message: "No se pudo eliminar producto con id " + req.params.id });
      }
    } else res.send({ message: "Producto eliminado correctamente!" });
  });
};

// Eliminar todos los productos
exports.deleteAll = (req, res) => {
  Producto.removeAll((err, data) => {
    if (err)
      res.status(500).send({ message: err.message || "Error eliminando todos los productos." });
    else
      res.send({ message: "Todos los productos fueron eliminados correctamente!" });
  });
};
