import axios from 'axios';

/**
 * ============================================
 * CONFIGURACIÓN DE AXIOS
 * Cliente HTTP con interceptors
 * ============================================
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================================
 * REQUEST INTERCEPTOR
 * Agregar token a todas las peticiones
 * ============================================
 */
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

/**
 * ============================================
 * RESPONSE INTERCEPTOR
 * Manejo automático de errores y refresh token
 * ============================================
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (no autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está renovando el token, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No hay refresh token, redirigir al login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intentar renovar el token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken } = response.data;

        // Guardar nuevo token
        localStorage.setItem('token', newToken);

        // Actualizar header
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Procesar cola de peticiones pendientes
        processQueue(null, newToken);

        isRefreshing = false;

        // Reintentar petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Error al renovar token, cerrar sesión
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.clear();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Manejo de otros errores
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';

    console.error('❌ Error en response:', errorMessage);

    // Devolver error formateado
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

/**
 * ============================================
 * SERVICIOS DE API
 * ============================================
 */

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const statesAPI = {
  getAll: (params) => api.get('/states', { params }),
  getById: (id) => api.get(`/states/${id}`),
  create: (data) => api.post('/states', data),
  update: (id, data) => api.put(`/states/${id}`, data),
  delete: (id) => api.delete(`/states/${id}`),
  search: (query) => api.get('/states/search', { params: { q: query } }),
};

export const delegationsAPI = {
  getAll: (params) => api.get('/delegations', { params }),
  getByState: (stateId) => api.get(`/delegations/state/${stateId}`),
  getById: (id) => api.get(`/delegations/${id}`),
  create: (data) => api.post('/delegations', data),
  update: (id, data) => api.put(`/delegations/${id}`, data),
  delete: (id) => api.delete(`/delegations/${id}`),
};

export const coloniesAPI = {
  getAll: (params) => api.get('/colonies', { params }),
  getByDelegation: (delegationId) => api.get(`/colonies/delegation/${delegationId}`),
  getById: (id) => api.get(`/colonies/${id}`),
  create: (data) => api.post('/colonies', data),
  update: (id, data) => api.put(`/colonies/${id}`, data),
  delete: (id) => api.delete(`/colonies/${id}`),
};

export const familiesAPI = {
  getAll: (params) => api.get('/families', { params }),
  getByColony: (colonyId) => api.get(`/families/colony/${colonyId}`),
  getById: (id) => api.get(`/families/${id}`),
  create: (data) => api.post('/families', data),
  update: (id, data) => api.put(`/families/${id}`, data),
  delete: (id) => api.delete(`/families/${id}`),
};

export const personsAPI = {
  getAll: (params) => api.get('/persons', { params }),
  getByFamily: (familyId) => api.get(`/persons/family/${familyId}`),
  getById: (id) => api.get(`/persons/${id}`),
  search: (query, params) => api.get('/persons/search', { params: { q: query, ...params } }),
  create: (data) => api.post('/persons', data),
  createBatch: (persons) => api.post('/persons/batch', { persons }),
  update: (id, data) => api.put(`/persons/${id}`, data),
  delete: (id) => api.delete(`/persons/${id}`),
};

export const reportsAPI = {
  getGeneral: () => api.get('/reports/general'),
  getCoverage: () => api.get('/reports/coverage'),
  getVoters: () => api.get('/reports/voters'),
  getByState: (stateId) => api.get(`/reports/state/${stateId}`),
  getByDelegation: (delegationId) => api.get(`/reports/delegation/${delegationId}`),
  export: (type, filters) => api.get('/reports/export', {
    params: { type, ...filters },
    responseType: 'blob',
  }),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getActivity: (id) => api.get(`/users/${id}/activity`),
};

export default api;
