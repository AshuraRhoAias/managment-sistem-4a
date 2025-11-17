const authService = require('../services/auth.service');
const { HTTP_STATUS, SUCCESS, ERRORS } = require('../config/constants');

/**
 * ============================================
 * CONTROLADOR DE AUTENTICACIÓN
 * ============================================
 */

class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERRORS.BAD_REQUEST,
          message: 'Email y contraseña son requeridos',
        });
      }

      const result = await authService.login(email, password, req);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS.LOGIN,
        ...result,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.INVALID_CREDENTIALS,
        message: error.message || 'Error en el inicio de sesión',
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      await authService.logout(req.user.jti, req.user.id, req);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS.LOGOUT,
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER).json({
        success: false,
        error: ERRORS.INTERNAL_SERVER,
        message: 'Error al cerrar sesión',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERRORS.BAD_REQUEST,
          message: 'Refresh token requerido',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.TOKEN_INVALID,
        message: 'Refresh token inválido o expirado',
      });
    }
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER).json({
        success: false,
        error: ERRORS.INTERNAL_SERVER,
        message: 'Error al obtener información del usuario',
      });
    }
  }

  /**
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERRORS.BAD_REQUEST,
          message: 'Contraseña actual y nueva son requeridas',
        });
      }

      if (newPassword.length < 8) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERRORS.VALIDATION_ERROR,
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
        });
      }

      await authService.changePassword(req.user.id, oldPassword, newPassword);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS.UPDATED,
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.BAD_REQUEST,
        message: error.message || 'Error al cambiar contraseña',
      });
    }
  }

  /**
   * GET /api/auth/sessions
   */
  async getUserSessions(req, res) {
    try {
      const sessions = await authService.getUserSessions(req.user.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER).json({
        success: false,
        error: ERRORS.INTERNAL_SERVER,
        message: 'Error al obtener sesiones',
      });
    }
  }
}

module.exports = new AuthController();
