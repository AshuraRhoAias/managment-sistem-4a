const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { RATE_LIMITS, HTTP_STATUS } = require('../config/constants');

/**
 * ============================================
 * RATE LIMITERS
 * Protección contra abuso de API
 * ============================================
 */

/**
 * Rate limiter para autenticación (más estricto)
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: {
    success: false,
    error: RATE_LIMITS.AUTH.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown'
    );
  },
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    console.warn(`⚠️ Rate limit exceeded for AUTH from IP: ${ip}`);

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: RATE_LIMITS.AUTH.message,
      retryAfter: Math.ceil(RATE_LIMITS.AUTH.windowMs / 1000 / 60),
    });
  },
});

/**
 * Rate limiter para operaciones de lectura
 */
const readLimiter = rateLimit({
  windowMs: RATE_LIMITS.API_READ.windowMs,
  max: RATE_LIMITS.API_READ.max,
  message: {
    success: false,
    error: RATE_LIMITS.API_READ.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown'
    );
  },
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    console.warn(`⚠️ Rate limit exceeded for READ from IP: ${ip}`);

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: RATE_LIMITS.API_READ.message,
      retryAfter: Math.ceil(RATE_LIMITS.API_READ.windowMs / 1000 / 60),
    });
  },
});

/**
 * Rate limiter para operaciones de escritura (más estricto)
 */
const writeLimiter = rateLimit({
  windowMs: RATE_LIMITS.API_WRITE.windowMs,
  max: RATE_LIMITS.API_WRITE.max,
  message: {
    success: false,
    error: RATE_LIMITS.API_WRITE.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Combinar IP + Usuario para rate limiting más preciso
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  },
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    console.warn(`⚠️ Rate limit exceeded for WRITE from IP: ${ip}`);

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: RATE_LIMITS.API_WRITE.message,
      retryAfter: Math.ceil(RATE_LIMITS.API_WRITE.windowMs / 1000 / 60),
    });
  },
});

/**
 * Rate limiter para búsquedas
 */
const searchLimiter = rateLimit({
  windowMs: RATE_LIMITS.SEARCH.windowMs,
  max: RATE_LIMITS.SEARCH.max,
  message: {
    success: false,
    error: RATE_LIMITS.SEARCH.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  },
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    console.warn(`⚠️ Rate limit exceeded for SEARCH from IP: ${ip}`);

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: RATE_LIMITS.SEARCH.message,
      retryAfter: Math.ceil(RATE_LIMITS.SEARCH.windowMs / 1000 / 60),
    });
  },
});

/**
 * Rate limiter para exportaciones (muy estricto)
 */
const exportLimiter = rateLimit({
  windowMs: RATE_LIMITS.EXPORT.windowMs,
  max: RATE_LIMITS.EXPORT.max,
  message: {
    success: false,
    error: RATE_LIMITS.EXPORT.message,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  },
  handler: (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    console.warn(`⚠️ Rate limit exceeded for EXPORT from IP: ${ip}`);

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: RATE_LIMITS.EXPORT.message,
      retryAfter: Math.ceil(RATE_LIMITS.EXPORT.windowMs / 1000 / 60),
    });
  },
});

/**
 * ============================================
 * SLOW DOWN MIDDLEWARE
 * Ralentiza las peticiones progresivamente
 * ============================================
 */

/**
 * Slow down para escritura
 */
const writeSlowDown = slowDown({
  windowMs: 60 * 1000, // 1 minuto
  delayAfter: 10, // Permitir 10 peticiones rápidas
  delayMs: 500, // Delay incremental de 500ms
  maxDelayMs: 5000, // Máximo delay de 5 segundos
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  },
});

/**
 * Slow down para búsquedas
 */
const searchSlowDown = slowDown({
  windowMs: 60 * 1000, // 1 minuto
  delayAfter: 20, // Permitir 20 búsquedas rápidas
  delayMs: 300, // Delay incremental de 300ms
  maxDelayMs: 3000, // Máximo delay de 3 segundos
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${ip}:${userId}`;
  },
});

/**
 * ============================================
 * RATE LIMITER DINÁMICO POR ROL
 * ============================================
 */
function dynamicRateLimiter(options = {}) {
  const {
    adminMax = 1000,
    coordinadorMax = 500,
    capturistaMax = 200,
    anonymousMax = 50,
    windowMs = 60000,
  } = options;

  return rateLimit({
    windowMs,
    max: (req) => {
      // Si no hay usuario autenticado
      if (!req.user) {
        return anonymousMax;
      }

      // Según el rol del usuario
      switch (req.user.rol) {
        case 'ADMIN':
          return adminMax;
        case 'COORDINADOR':
          return coordinadorMax;
        case 'CAPTURISTA':
          return capturistaMax;
        default:
          return anonymousMax;
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      if (req.user) {
        return `user:${req.user.id}`;
      }
      return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    },
    handler: (req, res) => {
      const role = req.user?.rol || 'anonymous';
      console.warn(`⚠️ Rate limit exceeded for role ${role}`);

      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Ha excedido el límite de peticiones permitidas.',
        role,
      });
    },
  });
}

/**
 * ============================================
 * EXPORTAR
 * ============================================
 */
module.exports = {
  authLimiter,
  readLimiter,
  writeLimiter,
  searchLimiter,
  exportLimiter,
  writeSlowDown,
  searchSlowDown,
  dynamicRateLimiter,
};
