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
      const response = await api.get('/persons', { params });
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
      const response = await api.get(`/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Buscar personas (búsqueda cifrada)
   */
  search: async (query, params = {}) => {
    try {
      const response = await api.get('/persons/search', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener personas por familia
   */
  getByFamily: async (familyId) => {
    try {
      const response = await api.get(`/persons/family/${familyId}`);
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
      const response = await api.post('/persons', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear múltiples personas (batch)
   */
  createBatch: async (persons) => {
    try {
      const response = await api.post('/persons/batch', { persons });
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
      const response = await api.put(`/persons/${id}`, data);
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
      const response = await api.delete(`/persons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default personsService;
