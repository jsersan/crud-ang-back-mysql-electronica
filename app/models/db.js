const mysql = require('mysql2');
const dbConfig = require('../config/db.config');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.port || 8889,
  waitForConnections: true,
  connectionLimit: 10,  // ajusta según la carga real
  queueLimit: 0
});

pool.on('error', err => {
  console.error('MySQL Pool Error:', err);
  // Aquí podrías intentar recuperar el pool si lo creas programáticamente
});

module.exports = pool;
