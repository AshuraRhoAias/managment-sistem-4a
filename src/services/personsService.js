import api from './api';

/**
 * ============================================
 * SERVICIO DE PERSONAS
 * ============================================
 */

const personsService = {
  /**
   * Obtener todas las personas
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/electoral/persons', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener persona por ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/electoral/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Buscar por CURP
   */
  searchByCURP: async (curp) => {
    try {
      const response = await api.get(`/electoral/search/curp/${curp}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener estadísticas de personas
   */
  getStats: async () => {
    try {
      const response = await api.get('/electoral/persons/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear persona
   */
  create: async (data) => {
    try {
      const response = await api.post('/electoral/persons', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar persona
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/electoral/persons/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar persona
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/electoral/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default personsService;
