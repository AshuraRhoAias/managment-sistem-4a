const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const securityMiddleware = require('../middleware/security.middleware');

/**
 * ============================================
 * RUTAS DE AUTENTICACIÓN
 * ============================================
 */

// POST /api/auth/login - Login
router.post('/login',
  authLimiter,
  securityMiddleware.trackLoginAttempt,
  authController.login
);

// POST /api/auth/logout - Logout (requiere autenticación)
router.post('/logout',
  authMiddleware.verifyToken,
  authController.logout
);

// POST /api/auth/refresh - Renovar token
router.post('/refresh',
  authLimiter,
  authController.refreshToken
);

// GET /api/auth/me - Obtener usuario actual
router.get('/me',
  authMiddleware.verifyToken,
  authController.getCurrentUser
);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password',
  authMiddleware.verifyToken,
  authController.changePassword
);

// GET /api/auth/sessions - Obtener sesiones activas
router.get('/sessions',
  authMiddleware.verifyToken,
  authController.getUserSessions
);

module.exports = router;
