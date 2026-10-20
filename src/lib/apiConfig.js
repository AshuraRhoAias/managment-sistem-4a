// ============================================
// ⚙️ CONFIGURACIÓN DE LA CAPA DE API
//
// NEXT_PUBLIC_API_MODE:
//   mock  (por defecto) → datos en memoria, sin backend (ideal para demos y Vercel)
//   real                → peticiones HTTP al backend Express (NEXT_PUBLIC_API_URL)
// ============================================
export const API_MODE = String(process.env.NEXT_PUBLIC_API_MODE || 'mock').toLowerCase() === 'real'
    ? 'real'
    : 'mock'

export const USE_MOCK = API_MODE === 'mock'

// Acepta "http://host:3002" y también "http://host:3002/api" (se normaliza a la raíz).
export const API_URL = String(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '')

// Todas las rutas del backend cuelgan de /api
export const API_PREFIX = '/api'
export const ELECTORAL_PREFIX = `${API_PREFIX}/electoral`
export const AUTH_PREFIX = `${API_PREFIX}/auth`
