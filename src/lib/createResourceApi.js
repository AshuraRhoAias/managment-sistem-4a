import { request } from './httpClient'
import { ELECTORAL_PREFIX } from './apiConfig'

// ============================================
// 🧩 FÁBRICA DE CLIENTES CRUD
//
//   const casillasApi = createResourceApi('casillas')
//   casillasApi.list({ colonia_id: 3 })   // GET    /api/electoral/casillas?colonia_id=3
//   casillasApi.get(7)                    // GET    /api/electoral/casillas/7
//   casillasApi.create({ ... })           // POST   /api/electoral/casillas
//   casillasApi.update(7, { ... })        // PUT    /api/electoral/casillas/7
//   casillasApi.remove(7)                 // DELETE /api/electoral/casillas/7
//
// Para recursos fuera de /api/electoral pasa una ruta absoluta: createResourceApi('/api/auth/users')
// ============================================
export function createResourceApi(resource) {
    const base = resource.startsWith('/') ? resource : `${ELECTORAL_PREFIX}/${resource}`

    return {
        base,
        list: (query) => request(base, { query }),
        get: (id) => request(`${base}/${encodeURIComponent(id)}`),
        create: (body) => request(base, { method: 'POST', body }),
        update: (id, body) => request(`${base}/${encodeURIComponent(id)}`, { method: 'PUT', body }),
        remove: (id) => request(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    }
}
