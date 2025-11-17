import CookieManager from './CookieManager'

// ============================================
// 🌐 API CLIENT
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const apiClient = {
    async request(endpoint, options = {}) {
        const token = CookieManager.get('auth_token')

        const locationData = typeof window !== 'undefined'
            ? sessionStorage.getItem('userLocation')
            : null;

        let locationHeaders = {};
        if (locationData) {
            try {
                const location = JSON.parse(locationData);
                if (location.latitude && location.longitude) {
                    locationHeaders = {
                        'X-Browser-Latitude': location.latitude.toString(),
                        'X-Browser-Longitude': location.longitude.toString(),
                        'X-Location-Accuracy': location.accuracy ? location.accuracy.toString() : '0'
                    };
                }
            } catch (err) {
                console.error('Error parsing location data:', err);
            }
        }

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...locationHeaders,
                ...options.headers,
            },
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config)
            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || data.error || 'Error en la petición'
                }
            }

            return data
        } catch (error) {
            console.error('API Client Error:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    },

    // ✅ RUTAS CORREGIDAS CON 
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },

    async register(nombre, email, password, rol) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password, rol })
        })
    },

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        })
    },

    async refreshToken(refreshToken) {
        return this.request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        })
    },

    async getCurrentUser() {
        return this.request('/auth/me', {
            method: 'GET'
        })
    },

    async changePassword(oldPassword, newPassword) {
        return this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword })
        })
    },

    async getSessions() {
        return this.request('/auth/sessions', {
            method: 'GET'
        })
    },

    // APIs Electorales
    async getStats() {
        return this.request('/electoral/stats', {
            method: 'GET'
        })
    },

    async getStates() {
        return this.request('/electoral/states', {
            method: 'GET'
        })
    },

    async getFamilies(filters = {}) {
        const query = new URLSearchParams(filters).toString()
        return this.request(`/electoral/families${query ? '?' + query : ''}`, {
            method: 'GET'
        })
    },

    async getPersons(filters = {}) {
        const query = new URLSearchParams(filters).toString()
        return this.request(`/electoral/persons${query ? '?' + query : ''}`, {
            method: 'GET'
        })
    }
}

export default apiClient