require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { testConnection, closePools } = require('./config/database');
const { getAllCacheStats } = require('./config/cache');
const securityMiddleware = require('./middleware/security.middleware');
const authRoutes = require('./routes/auth.routes');

/**
 * ============================================
 * SERVIDOR PRINCIPAL
 * Sistema Electoral con Seguridad Avanzada
 * ============================================
 */

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * ============================================
 * MIDDLEWARE DE SEGURIDAD
 * ============================================
 */

// Helmet - Protección de headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

    // Permitir peticiones sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Compresión de respuestas
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware de seguridad personalizado
app.use(securityMiddleware.checkIPBlocked);
app.use(securityMiddleware.detectSuspiciousActivity);
app.use(securityMiddleware.validateHeaders);

/**
 * ============================================
 * RUTAS
 * ============================================
 */

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Cache stats (solo en desarrollo)
if (NODE_ENV === 'development') {
  app.get('/api/cache/stats', (req, res) => {
    res.json({
      success: true,
      data: getAllCacheStats(),
    });
  });
}

// API Routes
app.use('/api/auth', authRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

/**
 * ============================================
 * MANEJO DE ERRORES GLOBAL
 * ============================================
 */

app.use((err, req, res, next) => {
  console.error('Error global:', err);

  // Error de CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS_ERROR',
      message: 'Origen no permitido',
    });
  }

  // Error de JSON inválido
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'JSON inválido en el cuerpo de la petición',
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * ============================================
 * INICIAR SERVIDOR
 * ============================================
 */

async function startServer() {
  try {
    // Verificar conexión a base de datos
    console.log('🔄 Verificando conexión a base de datos...');
    await testConnection();

    // Iniciar servidor
    const server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SERVIDOR ELECTORAL INICIADO');
      console.log('='.repeat(60));
      console.log(`📡 Entorno: ${NODE_ENV}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔐 Seguridad: MÁXIMA (5 capas de cifrado)`);
      console.log(`⏰ Fecha: ${new Date().toLocaleString('es-MX')}`);
      console.log('='.repeat(60) + '\n');
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

/**
 * Cierre graceful del servidor
 */
async function gracefulShutdown(server) {
  console.log('\n⚠️  Señal de cierre recibida. Cerrando servidor...');

  // Dejar de aceptar nuevas conexiones
  server.close(async () => {
    console.log('✅ Servidor HTTP cerrado');

    try {
      // Cerrar conexiones a base de datos
      await closePools();
      console.log('✅ Conexiones a base de datos cerradas');

      console.log('👋 Servidor cerrado correctamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error durante el cierre:', error);
      process.exit(1);
    }
  });

  // Forzar cierre después de 30 segundos
  setTimeout(() => {
    console.error('⚠️  Forzando cierre del servidor...');
    process.exit(1);
  }, 30000);
}

// Iniciar servidor
if (require.main === module) {
  startServer();
}

module.exports = app;
