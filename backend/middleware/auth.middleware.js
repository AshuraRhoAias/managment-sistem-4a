const jwt = require('jsonwebtoken');
const { sessionCache } = require('../config/cache');
const { readPool } = require('../config/database');
const { SECURITY, ERRORS, HTTP_STATUS, PERMISSIONS } = require('../config/constants');

/**
 * ============================================
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * ============================================
 */

class AuthMiddleware {
  /**
   * Verificar token JWT
   */
  verifyToken = async (req, res, next) => {
    try {
      // Obtener token del header
      const authHeader = req.headers[SECURITY.TOKEN_HEADER];

      if (!authHeader || !authHeader.startsWith(SECURITY.TOKEN_PREFIX)) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.UNAUTHORIZED,
          message: 'Token no proporcionado',
        });
      }

      // Extraer token
      const token = authHeader.substring(SECURITY.TOKEN_PREFIX.length);

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar que el token no haya sido revocado
      const sessionKey = `session:${decoded.jti}`;
      const session = sessionCache.get(sessionKey);

      if (!session) {
        // Buscar en base de datos
        const [rows] = await readPool.query(
          'SELECT * FROM sesiones WHERE token_jti = ? AND is_active = 1',
          [decoded.jti]
        );

        if (rows.length === 0) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: ERRORS.TOKEN_INVALID,
            message: 'Token inválido o revocado',
          });
        }

        // Guardar en caché
        sessionCache.set(sessionKey, rows[0], 1800);
      }

      // Obtener información del usuario
      const [userRows] = await readPool.query(
        'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
        [decoded.userId]
      );

      if (userRows.length === 0 || !userRows[0].activo) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.UNAUTHORIZED,
          message: 'Usuario no encontrado o inactivo',
        });
      }

      // Agregar usuario al request
      req.user = {
        id: userRows[0].id,
        nombre: userRows[0].nombre,
        email: userRows[0].email,
        rol: userRows[0].rol,
        jti: decoded.jti,
      };

      // Actualizar última actividad de la sesión
      this.updateSessionActivity(decoded.jti);

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.TOKEN_EXPIRED,
          message: 'Token expirado',
          expiredAt: error.expiredAt,
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.TOKEN_INVALID,
          message: 'Token inválido',
        });
      }

      console.error('Error in auth middleware:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER).json({
        success: false,
        error: ERRORS.INTERNAL_SERVER,
        message: 'Error de autenticación',
      });
    }
  };

  /**
   * Verificar rol requerido
   */
  requireRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.UNAUTHORIZED,
          message: 'Usuario no autenticado',
        });
      }

      const userRole = req.user.rol;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        console.warn(`⚠️ Acceso denegado: Usuario ${req.user.id} (${userRole}) intentó acceder a ruta que requiere ${allowedRoles.join(', ')}`);

        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERRORS.FORBIDDEN,
          message: 'No tiene permisos suficientes para esta acción',
          requiredRoles: allowedRoles,
          userRole,
        });
      }

      next();
    };
  };

  /**
   * Verificar permiso específico
   */
  requirePermission = (permission) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERRORS.UNAUTHORIZED,
          message: 'Usuario no autenticado',
        });
      }

      const userRole = req.user.rol;
      const userPermissions = PERMISSIONS[userRole] || [];

      if (!userPermissions.includes(permission)) {
        console.warn(`⚠️ Permiso denegado: Usuario ${req.user.id} (${userRole}) intentó ${permission}`);

        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERRORS.FORBIDDEN,
          message: `No tiene permiso para: ${permission}`,
          userRole,
          userPermissions,
        });
      }

      next();
    };
  };

  /**
   * Verificar que el usuario sea el mismo o admin
   */
  requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.UNAUTHORIZED,
        message: 'Usuario no autenticado',
      });
    }

    const targetUserId = parseInt(req.params.id || req.params.userId);
    const currentUserId = req.user.id;
    const isAdmin = req.user.rol === 'ADMIN';

    if (currentUserId !== targetUserId && !isAdmin) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.FORBIDDEN,
        message: 'Solo puede acceder a su propia información',
      });
    }

    next();
  };

  /**
   * Middleware opcional (no falla si no hay token)
   */
  optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers[SECURITY.TOKEN_HEADER];

      if (!authHeader || !authHeader.startsWith(SECURITY.TOKEN_PREFIX)) {
        // No hay token, continuar sin usuario
        req.user = null;
        return next();
      }

      // Si hay token, verificar
      await this.verifyToken(req, res, next);
    } catch (error) {
      // Si falla, continuar sin usuario
      req.user = null;
      next();
    }
  };

  /**
   * Actualizar última actividad de sesión
   */
  async updateSessionActivity(jti) {
    try {
      const sessionKey = `session:${jti}`;
      const session = sessionCache.get(sessionKey);

      if (session) {
        session.last_activity = new Date();
        sessionCache.set(sessionKey, session, 1800);
      }

      // Actualizar en BD (de forma asíncrona, no bloqueante)
      setImmediate(async () => {
        try {
          const { writePool } = require('../config/database');
          await writePool.query(
            'UPDATE sesiones SET last_activity = NOW() WHERE token_jti = ?',
            [jti]
          );
        } catch (error) {
          console.error('Error updating session activity:', error);
        }
      });
    } catch (error) {
      console.error('Error in updateSessionActivity:', error);
    }
  }

  /**
   * Generar token JWT
   */
  generateToken(user) {
    const jti = require('crypto').randomUUID();

    const payload = {
      userId: user.id,
      email: user.email,
      rol: user.rol,
      jti,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m',
      issuer: process.env.JWT_ISSUER || 'electoral-system',
      audience: process.env.JWT_AUDIENCE || 'electoral-app',
    });

    return { token, jti };
  }

  /**
   * Generar refresh token
   */
  generateRefreshToken(user) {
    const jti = require('crypto').randomUUID();

    const payload = {
      userId: user.id,
      type: 'refresh',
      jti,
    };

    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: process.env.JWT_ISSUER || 'electoral-system',
      audience: process.env.JWT_AUDIENCE || 'electoral-app',
    });

    return { token, jti };
  }

  /**
   * Verificar refresh token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revocar token (logout)
   */
  async revokeToken(jti) {
    try {
      // Eliminar de caché
      const sessionKey = `session:${jti}`;
      sessionCache.del(sessionKey);

      // Marcar como inactiva en BD
      const { writePool } = require('../config/database');
      await writePool.query(
        'UPDATE sesiones SET is_active = 0 WHERE token_jti = ?',
        [jti]
      );

      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  /**
   * Revocar todas las sesiones de un usuario
   */
  async revokeAllUserTokens(userId) {
    try {
      const { writePool } = require('../config/database');

      // Obtener todas las sesiones activas
      const [sessions] = await readPool.query(
        'SELECT token_jti FROM sesiones WHERE usuario_id = ? AND is_active = 1',
        [userId]
      );

      // Eliminar de caché
      sessions.forEach(session => {
        const sessionKey = `session:${session.token_jti}`;
        sessionCache.del(sessionKey);
      });

      // Marcar como inactivas en BD
      await writePool.query(
        'UPDATE sesiones SET is_active = 0 WHERE usuario_id = ?',
        [userId]
      );

      return true;
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      return false;
    }
  }
}

// Singleton
const authMiddleware = new AuthMiddleware();

module.exports = authMiddleware;
