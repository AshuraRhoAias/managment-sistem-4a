import CookieManager from '@/Utils/Login/CookieManager'
import { API_URL, AUTH_PREFIX } from './apiConfig'

// ============================================
// 🌐 CLIENTE HTTP ÚNICO
//
// - Agrega el JWT (cookie auth_token) y la ubicación del navegador.
// - Si el backend responde 401 intenta renovar el token UNA vez con el refresh token.
// - Siempre devuelve { success, data?, error?, status? } y nunca lanza excepciones.
// ============================================
const isBrowser = () => typeof window !== 'undefined'

export const buildQuery = (query = {}) => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') params.append(key, value)
    })
    const qs = params.toString()
    return qs ? `?${qs}` : ''
}

const locationHeaders = () => {
    if (!isBrowser()) return {}
    try {
        const raw = sessionStorage.getItem('userLocation')
        if (!raw) return {}
        const { latitude, longitude, accuracy } = JSON.parse(raw)
        if (!latitude || !longitude) return {}
        return {
            'X-Browser-Latitude': String(latitude),
            'X-Browser-Longitude': String(longitude),
            'X-Location-Accuracy': String(accuracy || 0),
        }
    } catch {
        return {}
    }
}

let refreshPromise = null

// Renueva el token de acceso; varias peticiones simultáneas comparten una sola renovación.
export const refreshAccessToken = () => {
    if (!isBrowser()) return Promise.resolve(false)
    const refreshToken = CookieManager.get('refresh_token')
    if (!refreshToken) return Promise.resolve(false)

    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const response = await fetch(`${API_URL}${AUTH_PREFIX}/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                })
                const body = await response.json().catch(() => ({}))
                if (response.ok && body.token) {
                    CookieManager.set('auth_token', body.token, 1)
                    return true
                }
                return false
            } catch {
                return false
            } finally {
                refreshPromise = null
            }
        })()
    }
    return refreshPromise
}

const buildRequest = (path, { method = 'GET', body, query, headers = {}, auth = true } = {}) => {
    const token = auth && isBrowser() ? CookieManager.get('auth_token') : null
    return {
        url: `${API_URL}${path}${buildQuery(query)}`,
        init: {
            method,
            headers: {
                ...(body !== undefined && { 'Content-Type': 'application/json' }),
                ...(token && { Authorization: `Bearer ${token}` }),
                ...locationHeaders(),
                ...headers,
            },
            ...(body !== undefined && { body: JSON.stringify(body) }),
        },
    }
}

const errorMessage = (payload, status) =>
    payload?.message || payload?.error || `Error en la petición (${status})`

/**
 * request('/api/electoral/states', { method, body, query, headers, auth })
 */
export async function request(path, options = {}) {
    const { auth = true, retry = true } = options
    try {
        const { url, init } = buildRequest(path, options)
        const response = await fetch(url, init)

        if (response.status === 401 && auth && retry && (await refreshAccessToken())) {
            return request(path, { ...options, retry: false })
        }

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
            return { success: false, error: errorMessage(payload, response.status), status: response.status }
        }

        // El backend responde { success, data } (o campos al nivel raíz en /auth/login y /auth/refresh)
        return payload && typeof payload === 'object' ? { success: true, ...payload } : { success: true, data: payload }
    } catch (error) {
        console.error('API request failed:', path, error)
        return { success: false, error: 'Error de conexión con el servidor' }
    }
}

/**
 * Descarga un archivo (CSV, PDF…) con el token del usuario.
 * Devuelve { success, data: { blob, filename } }.
 */
export async function requestFile(path, options = {}) {
    const { auth = true, retry = true } = options
    try {
        const { url, init } = buildRequest(path, options)
        const response = await fetch(url, init)

        if (response.status === 401 && auth && retry && (await refreshAccessToken())) {
            return requestFile(path, { ...options, retry: false })
        }

        if (!response.ok) {
            const payload = await response.json().catch(() => null)
            return { success: false, error: errorMessage(payload, response.status), status: response.status }
        }

        const disposition = response.headers.get('content-disposition') || ''
        const match = /filename="?([^";]+)"?/i.exec(disposition)
        return { success: true, data: { blob: await response.blob(), filename: match ? match[1] : 'descarga' } }
    } catch {
        return { success: false, error: 'Error de conexión con el servidor' }
    }
}

// Lanza si la respuesta no fue exitosa; útil dentro de data sources.
export const unwrap = (result) => {
    if (!result.success) throw new Error(result.error || 'Error en la petición')
    return result.data
}
