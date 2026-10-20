import { request } from '@/lib/httpClient'
import { AUTH_PREFIX } from '@/lib/apiConfig'

// ============================================
// 🌐 AUTENTICACIÓN REAL (NEXT_PUBLIC_API_MODE=real)
// Traduce las respuestas de /api/auth/* al contrato que usa AuthContext:
//   login → { success, data: { token, refreshToken, usuario } }
// ============================================
const httpApiClient = {
    async login(email, password) {
        const result = await request(`${AUTH_PREFIX}/login`, { method: 'POST', body: { email, password }, auth: false })
        if (!result.success) return result

        // El backend responde { token, refreshToken, user } en la raíz
        return {
            success: true,
            data: { token: result.token, refreshToken: result.refreshToken, usuario: result.user },
        }
    },

    async register(nombre, email, password, secretPhrase, rol) {
        // secretPhrase / rol no se envían: el servidor asigna el rol y no guarda frases maestras.
        void secretPhrase
        void rol
        return request(`${AUTH_PREFIX}/register`, { method: 'POST', body: { nombre, email, password }, auth: false })
    },

    async logout() {
        return request(`${AUTH_PREFIX}/logout`, { method: 'POST', retry: false })
    },

    async refreshToken(refreshToken) {
        return request(`${AUTH_PREFIX}/refresh`, { method: 'POST', body: { refreshToken }, auth: false })
    },

    // Valida el token guardado (renueva solo si expiró)
    async verifyToken() {
        return request(`${AUTH_PREFIX}/me`)
    },

    async getCurrentUser() {
        return request(`${AUTH_PREFIX}/me`)
    },

    async changePassword(oldPassword, newPassword) {
        return request(`${AUTH_PREFIX}/change-password`, { method: 'PUT', body: { oldPassword, newPassword } })
    },

    async getSessions() {
        return request(`${AUTH_PREFIX}/sessions`)
    },

    async decryptPassword() {
        return { success: false, error: 'Esta función no está disponible con el backend real' }
    },
}

export default httpApiClient
