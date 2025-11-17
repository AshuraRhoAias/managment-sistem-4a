import CookieManager from './CookieManager'

// ============================================
// 🌐 API CLIENT
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const apiClient = {
    async request(endpoint, options = {}) {
        const token = CookieManager.get('auth_token')

        // Obtener ubicación del usuario desde sessionStorage
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

            // El backend retorna { success: true, data: {...} }
            // Retornamos el objeto completo tal como viene
            return data
        } catch (error) {
            console.error('API Client Error:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    },

    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },

    async register(nombre, email, password) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, password })
        })
    },

    async decryptPassword(userId, masterPhrase) {
        return this.request('/api/auth/decrypt-password', {
            method: 'POST',
            body: JSON.stringify({ userId, masterPhrase })
        })
    },

    async verifyToken() {
        return this.request('/api/auth/verify', {
            method: 'GET'
        })
    }
}

export default apiClient