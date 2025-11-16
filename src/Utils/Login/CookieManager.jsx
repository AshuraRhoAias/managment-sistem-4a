// ============================================
// 🔐 UTILIDADES DE SEGURIDAD - Cookies
// ============================================
const CookieManager = {
    set(name, value, days = 7) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        const expires = `expires=${date.toUTCString()}`
        const secure = window.location.protocol === 'https:' ? 'Secure;' : ''
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict;${secure}`
    },

    get(name) {
        const nameEQ = name + "="
        const ca = document.cookie.split(';')
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i]
            while (c.charAt(0) === ' ') c = c.substring(1, c.length)
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length))
            }
        }
        return null
    },

    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
    },

    clearAll() {
        this.delete('auth_token')
        this.delete('refresh_token')
        this.delete('user_data')
    }
}

export default CookieManager