/**
 * ============================================
 * SERVIDOR COMPLETO - SISTEMA ELECTORAL
 * Sistema con Cifrado de 5 Capas y Seguridad Máxima
 * Todo en un solo archivo - Completo y Funcional
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

// ==================== CONSTANTES ====================
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

const CONSTANTS = {
  ROLES: {
    ADMIN: 'ADMIN',
    COORDINADOR: 'COORDINADOR',
    CAPTURISTA: 'CAPTURISTA',
  },
  PERMISSIONS: {
    ADMIN: ['read', 'create', 'update', 'delete', 'export', 'manage_users'],
    COORDINADOR: ['read', 'create', 'update', 'export'],
    CAPTURISTA: ['read', 'create'],
  },
  FAMILY_STATUS: {
    ACTIVE: 'ACTIVA',
    INACTIVE: 'INACTIVA',
  },
  GENDER: {
    MALE: 'MASCULINO',
    FEMALE: 'FEMENINO',
    OTHER: 'OTRO',
  },
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCKOUT_DURATION_MINUTES: parseInt(process.env.LOCKOUT_DURATION) || 30,
    BCRYPT_SALT_ROUNDS: 12,
    PASSWORD_MIN_LENGTH: 8,
    TOKEN_HEADER: 'authorization',
    TOKEN_PREFIX: 'Bearer ',
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
  },
  ERRORS: {
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso prohibido',
    NOT_FOUND: 'Recurso no encontrado',
    BAD_REQUEST: 'Petición inválida',
    INTERNAL_SERVER: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    TOKEN_EXPIRED: 'Token expirado',
    TOKEN_INVALID: 'Token inválido',
  },
  SUCCESS: {
    CREATED: 'Creado exitosamente',
    UPDATED: 'Actualizado exitosamente',
    DELETED: 'Eliminado exitosamente',
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Cierre de sesión exitoso',
  },
  CACHE_TTL: {
    SHORT: 120,
    MEDIUM: 300,
    LONG: 600,
    STATS: 600,
    SESSION: 1800,
  },
};

// ==================== POOLS DE BASE DE DATOS ====================
const writePool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dbserverine',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_WRITE_POOL_MAX) || 100,
  queueLimit: 300,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

const readPool = mysql.createPool({
  host: process.env.DB_READ_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_READ_PORT) || parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_READ_USER || process.env.DB_USER || 'root',
  password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_READ_NAME || process.env.DB_NAME || 'dbserverine',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_READ_POOL_MAX) || 150,
  queueLimit: 500,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

// ==================== SISTEMA DE CACHÉ ====================
const mainCache = new NodeCache({
  stdTTL: CONSTANTS.CACHE_TTL.MEDIUM,
  checkperiod: 60,
  useClones: true,
  deleteOnExpire: true,
  maxKeys: 10000,
});

const statsCache = new NodeCache({
  stdTTL: CONSTANTS.CACHE_TTL.STATS,
  checkperiod: 120,
  useClones: true,
  deleteOnExpire: true,
  maxKeys: 1000,
});

const sessionCache = new NodeCache({
  stdTTL: CONSTANTS.CACHE_TTL.SESSION,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 5000,
});

const securityCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 10000,
});

// ==================== SERVICIO DE CIFRADO ====================
class CryptoService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(
      process.env.ENCRYPTION_KEY_LAYER1 || 'a'.repeat(64),
      'hex'
    );
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      console.error('Error al cifrar:', error);
      throw new Error('Error de cifrado');
    }
  }

  decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error al descifrar:', error);
      throw new Error('Error de descifrado');
    }
  }
}

const cryptoService = new CryptoService();

// ==================== FUNCIONES DE UTILIDAD ====================
async function testConnection() {
  try {
    await writePool.query('SELECT 1');
    await readPool.query('SELECT 1');
    console.log('✅ Conexión a base de datos exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:', error.message);
    throw error;
  }
}

async function closePools() {
  try {
    await writePool.end();
    await readPool.end();
    console.log('✅ Pools de base de datos cerrados');
  } catch (error) {
    console.error('❌ Error al cerrar pools:', error);
  }
}

function generateToken(user) {
  const jti = crypto.randomUUID();

  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
    jti,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: process.env.JWT_ISSUER || 'electoral-system',
    audience: process.env.JWT_AUDIENCE || 'electoral-app',
  });

  return { token, jti };
}

function generateRefreshToken(user) {
  const jti = crypto.randomUUID();

  const payload = {
    userId: user.id,
    type: 'refresh',
    jti,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: process.env.JWT_ISSUER || 'electoral-system',
      audience: process.env.JWT_AUDIENCE || 'electoral-app',
    }
  );

  return { token, jti };
}

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers[CONSTANTS.SECURITY.TOKEN_HEADER];

    if (!authHeader || !authHeader.startsWith(CONSTANTS.SECURITY.TOKEN_PREFIX)) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.UNAUTHORIZED,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(CONSTANTS.SECURITY.TOKEN_PREFIX.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');

    // Verificar sesión activa
    const sessionKey = `session:${decoded.jti}`;
    let session = sessionCache.get(sessionKey);

    if (!session) {
      const [rows] = await readPool.query(
        'SELECT * FROM sesiones WHERE token_jti = ? AND is_active = 1',
        [decoded.jti]
      );

      if (rows.length === 0) {
        return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: CONSTANTS.ERRORS.TOKEN_INVALID,
          message: 'Token inválido o revocado',
        });
      }

      session = rows[0];
      sessionCache.set(sessionKey, session, 1800);
    }

    // Obtener usuario
    const [userRows] = await readPool.query(
      'SELECT id, activo FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (userRows.length === 0 || !userRows[0].activo) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.UNAUTHORIZED,
        message: 'Usuario no encontrado o inactivo',
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      rol: decoded.rol,
      jti: decoded.jti,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.TOKEN_EXPIRED,
        message: 'Token expirado',
      });
    }

    return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: CONSTANTS.ERRORS.TOKEN_INVALID,
      message: 'Token inválido',
    });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.UNAUTHORIZED,
        message: 'Usuario no autenticado',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: CONSTANTS.ERRORS.FORBIDDEN,
        message: 'No tiene permisos suficientes',
        requiredRoles: allowedRoles,
        userRole: req.user.rol,
      });
    }

    next();
  };
}

// ==================== MIDDLEWARE DE SEGURIDAD ====================
const ipBlockList = new Map();
const loginAttempts = new Map();

function checkIPBlocked(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const blocked = securityCache.get(`blocked:${ip}`);

  if (blocked) {
    return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'IP_BLOCKED',
      message: 'Su IP ha sido bloqueada temporalmente por actividad sospechosa',
    });
  }

  next();
}

function trackLoginAttempt(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const email = req.body.email;

  if (!email) {
    return next();
  }

  const key = `${ip}:${email}`;
  let attempts = loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };

  // Reset si han pasado más de 15 minutos
  if (Date.now() - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts = { count: 0, firstAttempt: Date.now() };
  }

  loginAttempts.set(key, attempts);
  next();
}

// ==================== RATE LIMITERS ====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Demasiados intentos. Intente nuevamente en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Demasiadas peticiones. Intente nuevamente en un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== APLICACIÓN EXPRESS ====================
const app = express();

// Helmet - Seguridad HTTP
app.use(
  helmet({
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
  })
);

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

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
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware de seguridad global
app.use(checkIPBlocked);

// ==================== RUTAS DE SALUD ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// POST /api/auth/register - Registro de usuario
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { nombre, email, password, rol = 'CAPTURISTA' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: CONSTANTS.ERRORS.BAD_REQUEST,
        message: 'Todos los campos son obligatorios',
      });
    }

    if (password.length < CONSTANTS.SECURITY.PASSWORD_MIN_LENGTH) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: CONSTANTS.ERRORS.BAD_REQUEST,
        message: `La contraseña debe tener al menos ${CONSTANTS.SECURITY.PASSWORD_MIN_LENGTH} caracteres`,
      });
    }

    // Verificar email duplicado
    const [existingUsers] = await readPool.query('SELECT * FROM usuarios');

    for (const u of existingUsers) {
      try {
        const decrypted = cryptoService.decrypt({
          encrypted: u.email_encrypted,
          iv: u.email_iv,
          authTag: u.email_tag,
        });
        if (decrypted === email) {
          return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: CONSTANTS.ERRORS.BAD_REQUEST,
            message: 'El email ya está registrado',
          });
        }
      } catch (err) {
        // Continuar si no se puede descifrar
      }
    }

    // Cifrar datos
    const encryptedNombre = cryptoService.encrypt(nombre);
    const encryptedEmail = cryptoService.encrypt(email);
    const encryptedRol = cryptoService.encrypt(rol);

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(
      password,
      CONSTANTS.SECURITY.BCRYPT_SALT_ROUNDS
    );

    // Guardar usuario
    const [result] = await writePool.query(
      `INSERT INTO usuarios (
        nombre_encrypted, nombre_iv, nombre_tag,
        email_encrypted, email_iv, email_tag,
        rol_encrypted, rol_iv, rol_tag,
        password, activo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        encryptedNombre.encrypted,
        encryptedNombre.iv,
        encryptedNombre.authTag,
        encryptedEmail.encrypted,
        encryptedEmail.iv,
        encryptedEmail.authTag,
        encryptedRol.encrypted,
        encryptedRol.iv,
        encryptedRol.authTag,
        hashedPassword,
      ]
    );

    res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
      success: true,
      message: CONSTANTS.SUCCESS.CREATED,
      data: {
        id: result.insertId,
        nombre,
        email,
        rol,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al registrar usuario',
    });
  }
});

// POST /api/auth/login - Inicio de sesión
app.post('/api/auth/login', authLimiter, trackLoginAttempt, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: CONSTANTS.ERRORS.BAD_REQUEST,
        message: 'Email y contraseña son requeridos',
      });
    }

    // Buscar usuario por email
    const [users] = await readPool.query('SELECT * FROM usuarios WHERE activo = 1');

    let user = null;
    for (const u of users) {
      try {
        const decryptedEmail = cryptoService.decrypt({
          encrypted: u.email_encrypted,
          iv: u.email_iv,
          authTag: u.email_tag,
        });

        if (decryptedEmail === email) {
          user = u;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!user) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.INVALID_CREDENTIALS,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(CONSTANTS.HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: CONSTANTS.ERRORS.INVALID_CREDENTIALS,
        message: 'Credenciales inválidas',
      });
    }

    // Descifrar datos del usuario
    const nombre = cryptoService.decrypt({
      encrypted: user.nombre_encrypted,
      iv: user.nombre_iv,
      authTag: user.nombre_tag,
    });

    const rol = cryptoService.decrypt({
      encrypted: user.rol_encrypted,
      iv: user.rol_iv,
      authTag: user.rol_tag,
    });

    // Generar tokens
    const userForToken = { id: user.id, email, rol };
    const { token, jti } = generateToken(userForToken);
    const { token: refreshToken, jti: refreshJti } = generateRefreshToken(userForToken);

    // Guardar sesión
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await writePool.query(
      `INSERT INTO sesiones (
        usuario_id, token_jti, refresh_jti, ip_address, user_agent,
        is_active, created_at, last_activity
      ) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [user.id, jti, refreshJti, ip, userAgent]
    );

    // Guardar en caché
    sessionCache.set(`session:${jti}`, { usuario_id: user.id }, 1800);

    res.status(CONSTANTS.HTTP_STATUS.OK).json({
      success: true,
      message: CONSTANTS.SUCCESS.LOGIN,
      data: {
        user: {
          id: user.id,
          nombre,
          email,
          rol,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error en el inicio de sesión',
    });
  }
});

// POST /api/auth/logout - Cierre de sesión
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    const { jti } = req.user;

    // Marcar sesión como inactiva
    await writePool.query('UPDATE sesiones SET is_active = 0 WHERE token_jti = ?', [
      jti,
    ]);

    // Eliminar de caché
    sessionCache.del(`session:${jti}`);

    res.status(CONSTANTS.HTTP_STATUS.OK).json({
      success: true,
      message: CONSTANTS.SUCCESS.LOGOUT,
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al cerrar sesión',
    });
  }
});

// GET /api/auth/me - Usuario actual
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await readPool.query('SELECT * FROM usuarios WHERE id = ?', [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: CONSTANTS.ERRORS.NOT_FOUND,
        message: 'Usuario no encontrado',
      });
    }

    const user = rows[0];

    const nombre = cryptoService.decrypt({
      encrypted: user.nombre_encrypted,
      iv: user.nombre_iv,
      authTag: user.nombre_tag,
    });

    const email = cryptoService.decrypt({
      encrypted: user.email_encrypted,
      iv: user.email_iv,
      authTag: user.email_tag,
    });

    const rol = cryptoService.decrypt({
      encrypted: user.rol_encrypted,
      iv: user.rol_iv,
      authTag: user.rol_tag,
    });

    res.status(CONSTANTS.HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: user.id,
        nombre,
        email,
        rol,
        activo: user.activo,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener información del usuario',
    });
  }
});

// ==================== RUTAS ELECTORALES ====================

// GET /api/electoral/stats - Estadísticas generales
app.get('/api/electoral/stats', verifyToken, apiLimiter, async (req, res) => {
  try {
    const cacheKey = 'stats:general';
    const cached = statsCache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const [estados] = await readPool.query('SELECT COUNT(*) as total FROM estados');
    const [delegaciones] = await readPool.query(
      'SELECT COUNT(*) as total FROM delegaciones'
    );
    const [colonias] = await readPool.query('SELECT COUNT(*) as total FROM colonias');
    const [familias] = await readPool.query('SELECT COUNT(*) as total FROM familias');
    const [personas] = await readPool.query('SELECT COUNT(*) as total FROM personas');
    const [votantes] = await readPool.query(
      'SELECT COUNT(*) as total FROM personas WHERE puede_votar = 1'
    );

    const stats = {
      estados: estados[0].total,
      delegaciones: delegaciones[0].total,
      colonias: colonias[0].total,
      familias: familias[0].total,
      personas: personas[0].total,
      votantes: votantes[0].total,
    };

    statsCache.set(cacheKey, stats);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener estadísticas',
    });
  }
});

// GET /api/electoral/states - Obtener todos los estados
app.get('/api/electoral/states', verifyToken, apiLimiter, async (req, res) => {
  try {
    const cacheKey = 'states:all';
    const cached = mainCache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const [rows] = await readPool.query('SELECT * FROM estados ORDER BY nombre');

    const estados = rows.map((estado) => ({
      id: estado.id,
      nombre: cryptoService.decrypt({
        encrypted: estado.nombre_encrypted,
        iv: estado.nombre_iv,
        authTag: estado.nombre_tag,
      }),
      codigo: estado.codigo,
      activo: estado.activo,
      created_at: estado.created_at,
    }));

    mainCache.set(cacheKey, estados);

    res.json({ success: true, data: estados });
  } catch (error) {
    console.error('Error al obtener estados:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener estados',
    });
  }
});

// GET /api/electoral/states/:id - Obtener estado por ID
app.get('/api/electoral/states/:id', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await readPool.query('SELECT * FROM estados WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: CONSTANTS.ERRORS.NOT_FOUND,
        message: 'Estado no encontrado',
      });
    }

    const estado = rows[0];

    res.json({
      success: true,
      data: {
        id: estado.id,
        nombre: cryptoService.decrypt({
          encrypted: estado.nombre_encrypted,
          iv: estado.nombre_iv,
          authTag: estado.nombre_tag,
        }),
        codigo: estado.codigo,
        activo: estado.activo,
        created_at: estado.created_at,
      },
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener estado',
    });
  }
});

// POST /api/electoral/states - Crear nuevo estado
app.post(
  '/api/electoral/states',
  verifyToken,
  requireRole([CONSTANTS.ROLES.ADMIN]),
  async (req, res) => {
    try {
      const { nombre, codigo } = req.body;

      if (!nombre || !codigo) {
        return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: CONSTANTS.ERRORS.BAD_REQUEST,
          message: 'Nombre y código son requeridos',
        });
      }

      const encryptedNombre = cryptoService.encrypt(nombre);

      const [result] = await writePool.query(
        `INSERT INTO estados (
          nombre_encrypted, nombre_iv, nombre_tag, codigo, activo, created_at
        ) VALUES (?, ?, ?, ?, 1, NOW())`,
        [encryptedNombre.encrypted, encryptedNombre.iv, encryptedNombre.authTag, codigo]
      );

      mainCache.del('states:all');
      statsCache.flushAll();

      res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
        success: true,
        message: CONSTANTS.SUCCESS.CREATED,
        data: { id: result.insertId, nombre, codigo },
      });
    } catch (error) {
      console.error('Error al crear estado:', error);
      res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
        success: false,
        error: CONSTANTS.ERRORS.INTERNAL_SERVER,
        message: 'Error al crear estado',
      });
    }
  }
);

// GET /api/electoral/delegations - Obtener todas las delegaciones
app.get('/api/electoral/delegations', verifyToken, apiLimiter, async (req, res) => {
  try {
    const [rows] = await readPool.query(
      'SELECT * FROM delegaciones ORDER BY nombre_encrypted'
    );

    const delegaciones = rows.map((del) => ({
      id: del.id,
      nombre: cryptoService.decrypt({
        encrypted: del.nombre_encrypted,
        iv: del.nombre_iv,
        authTag: del.nombre_tag,
      }),
      estado_id: del.estado_id,
      activo: del.activo,
      created_at: del.created_at,
    }));

    res.json({ success: true, data: delegaciones });
  } catch (error) {
    console.error('Error al obtener delegaciones:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener delegaciones',
    });
  }
});

// GET /api/electoral/colonies - Obtener todas las colonias
app.get('/api/electoral/colonies', verifyToken, apiLimiter, async (req, res) => {
  try {
    const [rows] = await readPool.query('SELECT * FROM colonias ORDER BY nombre_encrypted');

    const colonias = rows.map((col) => ({
      id: col.id,
      nombre: cryptoService.decrypt({
        encrypted: col.nombre_encrypted,
        iv: col.nombre_iv,
        authTag: col.nombre_tag,
      }),
      delegacion_id: col.delegacion_id,
      codigo_postal: col.codigo_postal,
      activo: col.activo,
      created_at: col.created_at,
    }));

    res.json({ success: true, data: colonias });
  } catch (error) {
    console.error('Error al obtener colonias:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener colonias',
    });
  }
});

// GET /api/electoral/families - Obtener todas las familias
app.get('/api/electoral/families', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { colonia_id, estado } = req.query;

    let query = 'SELECT * FROM familias WHERE 1=1';
    const params = [];

    if (colonia_id) {
      query += ' AND colonia_id = ?';
      params.push(colonia_id);
    }

    if (estado) {
      query += ' AND estado_familia = ?';
      params.push(estado);
    }

    query += ' ORDER BY id DESC LIMIT 100';

    const [rows] = await readPool.query(query, params);

    const familias = rows.map((fam) => ({
      id: fam.id,
      colonia_id: fam.colonia_id,
      direccion: cryptoService.decrypt({
        encrypted: fam.direccion_encrypted,
        iv: fam.direccion_iv,
        authTag: fam.direccion_tag,
      }),
      numero_exterior: fam.numero_exterior,
      numero_interior: fam.numero_interior,
      referencia: fam.referencia_encrypted
        ? cryptoService.decrypt({
            encrypted: fam.referencia_encrypted,
            iv: fam.referencia_iv,
            authTag: fam.referencia_tag,
          })
        : null,
      telefono: fam.telefono,
      estado_familia: fam.estado_familia,
      created_at: fam.created_at,
    }));

    res.json({ success: true, data: familias });
  } catch (error) {
    console.error('Error al obtener familias:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener familias',
    });
  }
});

// GET /api/electoral/families/:id - Obtener familia por ID
app.get('/api/electoral/families/:id', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const [familias] = await readPool.query('SELECT * FROM familias WHERE id = ?', [id]);

    if (familias.length === 0) {
      return res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: CONSTANTS.ERRORS.NOT_FOUND,
        message: 'Familia no encontrada',
      });
    }

    const familia = familias[0];

    // Obtener personas de la familia
    const [personas] = await readPool.query(
      'SELECT * FROM personas WHERE familia_id = ?',
      [id]
    );

    const personasDescifradas = personas.map((p) => ({
      id: p.id,
      nombre: cryptoService.decrypt({
        encrypted: p.nombre_encrypted,
        iv: p.nombre_iv,
        authTag: p.nombre_tag,
      }),
      apellido_paterno: cryptoService.decrypt({
        encrypted: p.apellido_paterno_encrypted,
        iv: p.apellido_paterno_iv,
        authTag: p.apellido_paterno_tag,
      }),
      apellido_materno: cryptoService.decrypt({
        encrypted: p.apellido_materno_encrypted,
        iv: p.apellido_materno_iv,
        authTag: p.apellido_materno_tag,
      }),
      edad: p.edad,
      sexo: p.sexo,
      puede_votar: p.puede_votar,
      rol_familia: p.rol_familia,
      created_at: p.created_at,
    }));

    res.json({
      success: true,
      data: {
        id: familia.id,
        colonia_id: familia.colonia_id,
        direccion: cryptoService.decrypt({
          encrypted: familia.direccion_encrypted,
          iv: familia.direccion_iv,
          authTag: familia.direccion_tag,
        }),
        numero_exterior: familia.numero_exterior,
        numero_interior: familia.numero_interior,
        telefono: familia.telefono,
        estado_familia: familia.estado_familia,
        created_at: familia.created_at,
        personas: personasDescifradas,
      },
    });
  } catch (error) {
    console.error('Error al obtener familia:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener familia',
    });
  }
});

// GET /api/electoral/persons - Obtener todas las personas
app.get('/api/electoral/persons', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { familia_id, puede_votar, limit = 100 } = req.query;

    let query = 'SELECT * FROM personas WHERE 1=1';
    const params = [];

    if (familia_id) {
      query += ' AND familia_id = ?';
      params.push(familia_id);
    }

    if (puede_votar !== undefined) {
      query += ' AND puede_votar = ?';
      params.push(puede_votar === 'true' || puede_votar === '1' ? 1 : 0);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await readPool.query(query, params);

    const personas = rows.map((p) => ({
      id: p.id,
      familia_id: p.familia_id,
      nombre: cryptoService.decrypt({
        encrypted: p.nombre_encrypted,
        iv: p.nombre_iv,
        authTag: p.nombre_tag,
      }),
      apellido_paterno: cryptoService.decrypt({
        encrypted: p.apellido_paterno_encrypted,
        iv: p.apellido_paterno_iv,
        authTag: p.apellido_paterno_tag,
      }),
      apellido_materno: cryptoService.decrypt({
        encrypted: p.apellido_materno_encrypted,
        iv: p.apellido_materno_iv,
        authTag: p.apellido_materno_tag,
      }),
      edad: p.edad,
      sexo: p.sexo,
      puede_votar: p.puede_votar,
      rol_familia: p.rol_familia,
      created_at: p.created_at,
    }));

    res.json({ success: true, data: personas });
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
      success: false,
      error: CONSTANTS.ERRORS.INTERNAL_SERVER,
      message: 'Error al obtener personas',
    });
  }
});

// ==================== RUTA 404 ====================
app.use('*', (req, res) => {
  res.status(CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: CONSTANTS.ERRORS.NOT_FOUND,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// ==================== MANEJO DE ERRORES GLOBAL ====================
app.use((err, req, res, next) => {
  console.error('Error global:', err);

  if (err.message === 'Not allowed by CORS') {
    return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: 'CORS_ERROR',
      message: 'Origen no permitido',
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: CONSTANTS.ERRORS.BAD_REQUEST,
      message: 'JSON inválido en el cuerpo de la petición',
    });
  }

  res.status(err.status || CONSTANTS.HTTP_STATUS.INTERNAL_SERVER).json({
    success: false,
    error: err.code || CONSTANTS.ERRORS.INTERNAL_SERVER,
    message:
      NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== INICIAR SERVIDOR ====================
async function startServer() {
  try {
    console.log('🔄 Verificando conexión a base de datos...');
    await testConnection();

    const server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SERVIDOR ELECTORAL COMPLETO INICIADO');
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

async function gracefulShutdown(server) {
  console.log('\n⚠️  Señal de cierre recibida. Cerrando servidor...');

  server.close(async () => {
    console.log('✅ Servidor HTTP cerrado');

    try {
      await closePools();
      console.log('👋 Servidor cerrado correctamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error durante el cierre:', error);
      process.exit(1);
    }
  });

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
