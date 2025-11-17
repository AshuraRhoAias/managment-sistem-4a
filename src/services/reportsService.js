import api from './api';

/**
 * ============================================
 * SERVICIO DE REPORTES
 * ============================================
 */

const reportsService = {
  /**
   * Obtener reporte general
   */
  getGeneral: async () => {
    try {
      const response = await api.get('/reports/general');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener cobertura
   */
  getCoverage: async () => {
    try {
      const response = await api.get('/reports/coverage');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener analytics de votantes
   */
  getVoters: async () => {
    try {
      const response = await api.get('/reports/voters');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener reporte por estado
   */
  getByState: async (stateId) => {
    try {
      const response = await api.get(`/reports/state/${stateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener reporte por delegación
   */
  getByDelegation: async (delegationId) => {
    try {
      const response = await api.get(`/reports/delegation/${delegationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Exportar datos
   */
  export: async (type, filters = {}) => {
    try {
      const response = await api.get('/reports/export', {
        params: { type, ...filters },
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Dashboard electoral
   */
  getDashboard: async () => {
    try {
      const response = await api.get('/electoral/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reportsService;
