const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');


// ✅ IMPORTAR KEEP-ALIVE SERVICE (TypeScript)
const keepAliveService = require('./services/leep-alive');
require('dotenv').config();

const app = express();

// Configuración de CORS - permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:4200',           // Desarrollo local
  'http://txemaserrano.com',         // Producción (sin HTTPS)
  'https://txemaserrano.com',        // Producción (con HTTPS)
  'https://crudbackendmysql.onrender.com' // Render backend si lo necesitas
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Parsear requests como JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ HEALTH CHECK MEJORADO (esencial para keep-alive)
app.get('/health', (req, res) => {
  const isKeepAlive = req.headers['x-keep-alive'] === 'true';
  
  // Si es un ping de keep-alive, respuesta mínima
  if (isKeepAlive) {
    return res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      keepAlive: true
    });
  }
  
  // Respuesta completa para checks externos
  res.json({ 
    message: 'Bienvenido a la API de productos.',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    keepAliveStats: keepAliveService.getStats()
  });
});

// ✅ NUEVO: Endpoint para estadísticas de keep-alive
app.get('/api/keep-alive/stats', (req, res) => {
  const stats = keepAliveService.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// ✅ NUEVO: Endpoint manual para despertar el servidor
app.post('/api/wake-up', (req, res) => {
  console.log('🌅 Wake-up request recibido');
  res.status(200).json({
    success: true,
    message: 'Servidor despierto y listo',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta simple para comprobar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenido a la API de productos.',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      wakeUp: '/api/wake-up',
      keepAliveStats: '/api/keep-alive/stats',
      productos: '/api/productos'
    }
  });
});

// Importar rutas de productos
require('./app/routes/producto.routes')(app);

// Establecer puerto y escuchar
const PORT = process.env.PORT || 3000;

// ✅ INICIAR SERVIDOR CON KEEP-ALIVE
const server = app.listen(PORT, () => {
  console.log('\n🎉 ================================');
  console.log('🎉 SERVIDOR CRUD-MYSQL OPTIMIZADO');
  console.log('🎉 ================================');
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}.`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URLs disponibles:`);
  console.log(`   • Health check: http://localhost:${PORT}/health`);
  console.log(`   • Wake up: http://localhost:${PORT}/api/wake-up`);
  console.log(`   • Keep-Alive stats: http://localhost:${PORT}/api/keep-alive/stats`);
  console.log(`   • API productos: http://localhost:${PORT}/api/productos`);
  
  // ✅ INICIAR KEEP-ALIVE (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    console.log(`   • ✅ Keep-Alive automático activado`);
    keepAliveService.start();
  } else {
    console.log(`   • ℹ️  Keep-Alive desactivado (desarrollo)`);
  }
  
  console.log('🎉 ================================\n');
});

// ✅ CIERRE GRACEFUL DEL SERVIDOR
const gracefulShutdown = (signal) => {
  console.log(`\n🔴 Recibida señal ${signal}, cerrando servidor gracefully...`);
  
  // Detener keep-alive
  keepAliveService.stop();
  
  server.close(() => {
    console.log('🔌 Servidor HTTP cerrado');
    console.log('👋 Servidor cerrado completamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    console.error('⚠️ Forzando cierre del servidor...');
    process.exit(1);
  }, 30000);
};

// Escuchar señales de cierre
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});