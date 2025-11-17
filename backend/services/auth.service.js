const bcrypt = require('bcryptjs');
const { readPool, writePool } = require('../config/database');
const authMiddleware = require('../middleware/auth.middleware');
const securityMiddleware = require('../middleware/security.middleware');
const { SECURITY, ERRORS } = require('../config/constants');

/**
 * ============================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================
 */

class AuthService {
  /**
   * Login de usuario
   */
  async login(email, password, req) {
    try {
      const clientIP = securityMiddleware.getClientIP(req);

      // Buscar usuario por email
      const [users] = await readPool.query(
        'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
        [email]
      );

      if (users.length === 0) {
        // Registrar intento fallido
        securityMiddleware.recordFailedLogin(req);

        throw new Error(ERRORS.INVALID_CREDENTIALS);
      }

      const user = users[0];

      // Verificar si está bloqueado temporalmente
      if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 1000 / 60);
        throw new Error(`Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos.`);
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Incrementar intentos fallidos
        await this.incrementFailedAttempts(user.id);

        // Registrar en middleware de seguridad
        securityMiddleware.recordFailedLogin(req);

        throw new Error(ERRORS.INVALID_CREDENTIALS);
      }

      // Login exitoso - limpiar intentos fallidos
      await this.resetFailedAttempts(user.id);
      securityMiddleware.clearLoginAttempts(req);

      // Generar tokens
      const { token, jti } = authMiddleware.generateToken(user);
      const { token: refreshToken, jti: refreshJti } = authMiddleware.generateRefreshToken(user);

      // Guardar sesión
      await this.createSession({
        usuario_id: user.id,
        token_jti: jti,
        refresh_token_jti: refreshJti,
        ip_address: clientIP,
        user_agent: req.headers['user-agent'] || 'unknown',
      });

      // Actualizar último login
      await writePool.query(
        'UPDATE usuarios SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Registrar en auditoría
      await this.logAudit(user.id, 'LOGIN', clientIP, req.headers['user-agent']);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout de usuario
   */
  async logout(jti, userId, req) {
    try {
      const clientIP = securityMiddleware.getClientIP(req);

      // Revocar token
      await authMiddleware.revokeToken(jti);

      // Registrar en auditoría
      await this.logAudit(userId, 'LOGOUT', clientIP, req.headers['user-agent']);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Renovar token con refresh token
   */
  async refreshToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = authMiddleware.verifyRefreshToken(refreshToken);

      // Verificar que la sesión exista y esté activa
      const [sessions] = await readPool.query(
        'SELECT * FROM sesiones WHERE refresh_token_jti = ? AND is_active = 1',
        [decoded.jti]
      );

      if (sessions.length === 0) {
        throw new Error('Refresh token inválido o expirado');
      }

      // Obtener usuario
      const [users] = await readPool.query(
        'SELECT * FROM usuarios WHERE id = ? AND activo = 1',
        [decoded.userId]
      );

      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = users[0];

      // Generar nuevo token
      const { token, jti } = authMiddleware.generateToken(user);

      // Actualizar sesión con nuevo token
      await writePool.query(
        'UPDATE sesiones SET token_jti = ?, last_activity = NOW() WHERE refresh_token_jti = ?',
        [jti, decoded.jti]
      );

      return {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear sesión en base de datos
   */
  async createSession(sessionData) {
    try {
      const { usuario_id, token_jti, refresh_token_jti, ip_address, user_agent } = sessionData;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

      await writePool.query(
        `INSERT INTO sesiones (usuario_id, token_jti, refresh_token_jti, ip_address, user_agent, expires_at, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [usuario_id, token_jti, refresh_token_jti, ip_address, user_agent, expiresAt]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Incrementar intentos fallidos
   */
  async incrementFailedAttempts(userId) {
    try {
      await writePool.query(
        'UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = ?',
        [userId]
      );

      // Verificar si debe bloquearse
      const [users] = await readPool.query(
        'SELECT intentos_fallidos FROM usuarios WHERE id = ?',
        [userId]
      );

      if (users[0].intentos_fallidos >= SECURITY.MAX_LOGIN_ATTEMPTS) {
        // Bloquear cuenta temporalmente
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() + SECURITY.LOCKOUT_DURATION_MINUTES);

        await writePool.query(
          'UPDATE usuarios SET bloqueado_hasta = ? WHERE id = ?',
          [blockUntil, userId]
        );

        console.warn(`🚫 Usuario ${userId} bloqueado hasta ${blockUntil}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resetear intentos fallidos
   */
  async resetFailedAttempts(userId) {
    try {
      await writePool.query(
        'UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?',
        [userId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar en auditoría
   */
  async logAudit(userId, action, ipAddress, userAgent, details = {}) {
    try {
      await writePool.query(
        `INSERT INTO auditoria_accesos (id_usuario, accion, ip_address, user_agent, detalles, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, action, ipAddress, userAgent, JSON.stringify(details)]
      );

      return true;
    } catch (error) {
      console.error('Error logging audit:', error);
      return false;
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(userId) {
    try {
      const [users] = await readPool.query(
        'SELECT id, nombre, email, rol, created_at, last_login FROM usuarios WHERE id = ? AND activo = 1',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      return users[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // Verificar contraseña actual
      const [users] = await readPool.query(
        'SELECT password FROM usuarios WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

      if (!isPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, SECURITY.BCRYPT_SALT_ROUNDS);

      // Actualizar contraseña
      await writePool.query(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      // Revocar todas las sesiones del usuario (forzar re-login)
      await authMiddleware.revokeAllUserTokens(userId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sesiones activas del usuario
   */
  async getUserSessions(userId) {
    try {
      const [sessions] = await readPool.query(
        `SELECT id, ip_address, user_agent, created_at, last_activity, expires_at
         FROM sesiones
         WHERE usuario_id = ? AND is_active = 1
         ORDER BY last_activity DESC`,
        [userId]
      );

      return sessions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cerrar sesión específica
   */
  async closeSession(sessionId, userId) {
    try {
      // Verificar que la sesión pertenece al usuario
      const [sessions] = await readPool.query(
        'SELECT token_jti FROM sesiones WHERE id = ? AND usuario_id = ?',
        [sessionId, userId]
      );

      if (sessions.length === 0) {
        throw new Error('Sesión no encontrada');
      }

      // Revocar token
      await authMiddleware.revokeToken(sessions[0].token_jti);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
