'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * ============================================
 * CONTEXT DE AUTENTICACIÓN
 * Manejo global del estado de autenticación
 * ============================================
 */

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Verificar si hay sesión activa al cargar
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Verificar autenticación
   */
  const checkAuth = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, refreshToken, user: userData } = response;

      // Guardar tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Actualizar estado
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local siempre
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Cambiar contraseña
   */
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        message: error.message || 'Error al cambiar contraseña',
      };
    }
  };

  /**
   * Verificar permisos
   */
  const hasPermission = (permission) => {
    if (!user) return false;

    const permissions = {
      ADMIN: ['read', 'create', 'update', 'delete', 'export', 'manage_users'],
      COORDINADOR: ['read', 'create', 'update', 'export'],
      CAPTURISTA: ['read', 'create'],
    };

    const userPermissions = permissions[user.rol] || [];
    return userPermissions.includes(permission);
  };

  /**
   * Verificar rol
   */
  const hasRole = (roles) => {
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.rol);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    hasPermission,
    hasRole,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
