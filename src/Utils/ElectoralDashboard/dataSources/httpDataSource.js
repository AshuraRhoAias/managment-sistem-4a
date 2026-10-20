import { request, requestFile, unwrap } from '@/lib/httpClient'
import { createResourceApi } from '@/lib/createResourceApi'
import { ELECTORAL_PREFIX } from '@/lib/apiConfig'

// ============================================
// 🌐 DATA SOURCE HTTP (backend Express + MySQL)
//
// Cada tabla de la UI se corresponde con un recurso REST de /api/electoral.
// Para exponer una tabla nueva solo hay que agregarla a RESOURCES.
// ============================================
const RESOURCES = {
    estados: createResourceApi('states'),
    delegaciones: createResourceApi('delegations'),
    colonias: createResourceApi('colonies'),
    familias: createResourceApi('families'),
    personas: createResourceApi('persons'),
}

// Recursos que no están en RESOURCES se resuelven como /api/electoral/<name>
const resource = (name) => {
    if (!RESOURCES[name]) RESOURCES[name] = createResourceApi(name)
    return RESOURCES[name]
}

const asArray = (data) => (Array.isArray(data) ? data : data?.data || [])

const httpDataSource = {
    name: 'http',

    async loadTables() {
        const names = Object.keys(RESOURCES)
        const responses = await Promise.all(names.map((name) => RESOURCES[name].list()))
        return Object.fromEntries(names.map((name, i) => [name, asArray(unwrap(responses[i]))]))
    },

    list: async (name, query) => asArray(unwrap(await resource(name).list(query))),

    create: async (name, data) => unwrap(await resource(name).create(data)),

    update: async (name, id, data) => unwrap(await resource(name).update(id, data)),

    remove: async (name, id) => {
        unwrap(await resource(name).remove(id))
    },

    // Búsqueda en el servidor: los datos sensibles están cifrados en la BD,
    // solo el backend puede descifrarlos y filtrarlos.
    search: async (term) => asArray(unwrap(await request(`${ELECTORAL_PREFIX}/search`, { query: { q: term } }))),

    // Descarga de archivos generados por el backend (CSV).
    exportFile: async (type, id) => {
        const result = await requestFile(`${ELECTORAL_PREFIX}/export/${encodeURIComponent(type)}`, {
            query: { format: 'csv', id },
        })
        return unwrap(result)
    },
}

export default httpDataSource
