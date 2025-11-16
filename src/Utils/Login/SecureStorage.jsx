import CookieManager from './CookieManager'

// ============================================
// 🔒 ALMACENAMIENTO SEGURO - MEJORADO
// ============================================
const SecureStorage = {
    encode(data) {
        return btoa(JSON.stringify(data))
    },

    decode(data) {
        try {
            return JSON.parse(atob(data))
        } catch {
            return null
        }
    },

    // Ahora usa cookies en lugar de sessionStorage
    setUser(value) {
        try {
            CookieManager.set('user_data', this.encode(value), 7) // 7 días
        } catch (error) {
            console.error('Error guardando usuario:', error)
        }
    },

    getUser() {
        try {
            const data = CookieManager.get('user_data')
            return data ? this.decode(data) : null
        } catch (error) {
            console.error('Error leyendo usuario:', error)
            return null
        }
    },

    removeUser() {
        CookieManager.delete('user_data')
    }
}

export default SecureStorage