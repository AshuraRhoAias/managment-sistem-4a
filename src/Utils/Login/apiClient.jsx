import CookieManager from './CookieManager'

// ============================================
// 🌐 API CLIENT
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const apiClient = {
    async request(endpoint, options = {}) {
        const token = CookieManager.get('auth_token')

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición')
            }

            return { success: true, data }
        } catch (error) {
            return { success: false, error: error.message }
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