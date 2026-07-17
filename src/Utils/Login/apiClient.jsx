import ElectoralApi from '../ElectoralDashboard/ElectoralApi'

// ============================================
// 🎭 CLIENTE DE AUTENTICACIÓN CON DATOS FALSOS
// Sin backend real: valida contra una lista de usuarios
// de demostración que vive en memoria.
// ============================================
const SIMULATED_DELAY_MS = 200
const delay = (ms = SIMULATED_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

let nextUserId = 100
const mockUsers = [
    { id: 1, nombre: 'Administrador', email: 'admin@demo.com', password: 'admin123', rol: 'ADMIN' },
    { id: 2, nombre: 'Usuario de Prueba', email: 'test@test.com', password: '123456', rol: 'ADMIN' },
]

const fakeToken = (prefix) => `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`

const publicUser = ({ password, ...user }) => user

const apiClient = {
    async login(email, password) {
        await delay()

        const user = mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())

        if (!user || user.password !== password) {
            return { success: false, error: 'Correo o contraseña incorrectos' }
        }

        return {
            success: true,
            data: {
                token: fakeToken('token'),
                refreshToken: fakeToken('refresh'),
                usuario: publicUser(user),
            },
        }
    },

    async register(nombre, email, password, secretPhrase, rol = 'CAPTURISTA') {
        await delay()

        if (mockUsers.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
            return { success: false, error: 'Ya existe una cuenta con ese correo' }
        }

        mockUsers.push({ id: nextUserId++, nombre, email, password, secretPhrase, rol })
        return { success: true }
    },

    async logout() {
        await delay()
        return { success: true }
    },

    async refreshToken() {
        await delay()
        return { success: true, data: { token: fakeToken('token') } }
    },

    async verifyToken() {
        // En modo de datos falsos cualquier token guardado localmente se considera válido.
        await delay()
        return { success: true }
    },

    async getCurrentUser() {
        await delay()
        const storedUser = mockUsers[0]
        return { success: true, data: publicUser(storedUser) }
    },

    async changePassword(oldPassword, newPassword) {
        await delay()
        return { success: true }
    },

    async decryptPassword(userId, masterPhrase) {
        await delay()
        return { success: true, data: { decryptedPassword: '••••••••' } }
    },

    async getSessions() {
        await delay()
        return { success: true, data: [] }
    },

    // APIs Electorales (delegan al mismo cliente de datos falsos del dashboard)
    async getStats() {
        return ElectoralApi.getGeneralStats()
    },

    async getStates() {
        return ElectoralApi.getAllStates()
    },

    async getFamilies(filters = {}) {
        return ElectoralApi.getAllFamilies(filters)
    },

    async getPersons(filters = {}) {
        return ElectoralApi.getAllPersons(filters)
    },
}

export default apiClient
