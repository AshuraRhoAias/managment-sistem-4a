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
      const response = await api.get('/electoral/states', { params });
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
      const response = await api.get(`/electoral/states/${id}`);
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
      const response = await api.post('/electoral/states', data);
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
      const response = await api.put(`/electoral/states/${id}`, data);
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
      const response = await api.delete(`/electoral/states/${id}`);
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
      const response = await api.get('/electoral/states/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener delegaciones del estado
   */
  getDelegations: async (id) => {
    try {
      const response = await api.get(`/electoral/states/${id}/delegations`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default statesService;
