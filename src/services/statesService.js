import api from './api';

/**
 * ============================================
 * SERVICIO DE ESTADOS
 * ============================================
 */

const statesService = {
  /**
   * Obtener todos los estados
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/states', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener estado por ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/states/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear estado
   */
  create: async (data) => {
    try {
      const response = await api.post('/states', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar estado
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/states/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar estado
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/states/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Buscar estados
   */
  search: async (query) => {
    try {
      const response = await api.get('/states/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener estadísticas del estado
   */
  getStats: async (id) => {
    try {
      const response = await api.get(`/states/${id}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default statesService;
