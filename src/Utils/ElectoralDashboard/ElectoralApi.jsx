import {
    estados,
    delegaciones,
    colonias,
    familias,
    personas,
    createRecord,
    updateRecord,
    deleteRecord,
    findById,
    familiasByColonia,
    personasByFamilia,
    coloniasByDelegacion,
    delegacionesByEstado,
    countFamiliasEnDelegacion,
    countPersonasEnDelegacion,
    countColoniasEnEstado,
    countFamiliasEnEstado,
    countPersonasEnEstado,
} from './mockElectoralData'

// ============================================
// 🎭 CLIENTE DE DATOS FALSOS (SIN BACKEND REAL)
// Simula la latencia y el contrato { success, data } / { success, error }
// que antes devolvía la API real, pero todo se resuelve en memoria.
// ============================================
const SIMULATED_DELAY_MS = 200

const delay = (ms = SIMULATED_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

const ok = async (data) => {
    await delay()
    return { success: true, data }
}

const fail = async (error) => {
    await delay()
    return { success: false, error: error?.message || String(error) }
}

const runMock = async (fn) => {
    try {
        return await ok(fn())
    } catch (error) {
        return await fail(error)
    }
}

// ============================================
// 📊 ELECTORAL API CLIENT (MOCK)
// ============================================
const ElectoralApi = {

    // ==================== DASHBOARD GENERAL ====================

    /**
     * Obtiene las estadísticas generales del dashboard
     */
    getGeneralStats: async () => {
        return runMock(() => {
            const totalFamilias = familias.length
            const totalPersonas = personas.length
            const totalColonias = colonias.length
            const totalDelegaciones = delegaciones.length
            const puedenVotar = personas.filter((p) => p.puede_votar).length
            const coverage = totalPersonas === 0
                ? 0
                : Math.round((puedenVotar / totalPersonas) * 100)

            return [
                { title: 'Estados', value: estados.length, subtitle: 'Estados registrados', trend: 0, iconType: 'map' },
                { title: 'Delegaciones', value: totalDelegaciones, subtitle: 'Delegaciones/Alcaldías', trend: 2, iconType: 'map' },
                { title: 'Colonias', value: totalColonias, subtitle: 'Colonias registradas', trend: 3, iconType: 'map' },
                { title: 'Familias Registradas', value: totalFamilias, subtitle: 'Total de familias', trend: 5, iconType: 'users' },
                { title: 'Personas Empadronadas', value: totalPersonas, subtitle: 'Total de personas', trend: 4, iconType: 'usercheck' },
                { title: 'Cobertura', value: `${coverage}%`, subtitle: 'Empadronamiento', trend: 1, iconType: 'chart' },
            ]
        })
    },

    /**
     * Obtiene el resumen mensual (gráfica)
     */
    getMonthlySummary: async () => {
        return runMock(() => {
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
            return meses.map((month, index) => ({
                month,
                familias: Math.round((familias.length / meses.length) * (index + 1)),
                personas: Math.round((personas.length / meses.length) * (index + 1)),
                votos: Math.round((personas.filter((p) => p.puede_votar).length / meses.length) * (index + 1)),
            }))
        })
    },

    /**
     * Obtiene la actividad reciente
     */
    getRecentActivity: async () => {
        return runMock(() => {
            const ultimasFamilias = [...familias].slice(-3).reverse()
            const ultimasPersonas = [...personas].slice(-2).reverse()

            return [
                ...ultimasFamilias.map((f) => ({
                    title: `Se registró la ${f.nombre_familia}`,
                    time: 'Hace poco',
                })),
                ...ultimasPersonas.map((p) => ({
                    title: `Se empadronó a ${p.nombre} ${p.apellidos}`,
                    time: 'Hace poco',
                })),
            ]
        })
    },

    // ==================== ESTADOS ====================

    getAllStates: async () => {
        return runMock(() =>
            estados.map((estado) => ({
                id: estado.id,
                name: estado.nombre,
                code: estado.codigo,
                delegations: delegacionesByEstado(estado.id).length,
                families: countFamiliasEnEstado(estado.id),
                persons: countPersonasEnEstado(estado.id),
            }))
        )
    },

    /**
     * Obtiene un estado específico con sus delegaciones
     */
    getStateById: async (stateId) => {
        return runMock(() => {
            const estado = findById(estados, stateId)
            const delegacionesEstado = delegacionesByEstado(estado.id)
            const families = countFamiliasEnEstado(estado.id)
            const persons = countPersonasEnEstado(estado.id)
            const puedenVotar = delegacionesEstado.reduce((total, delegacion) => {
                return total + coloniasByDelegacion(delegacion.id).reduce((sub, colonia) => {
                    return sub + familiasByColonia(colonia.id).reduce((s2, familia) => {
                        return s2 + personasByFamilia(familia.id).filter((p) => p.puede_votar).length
                    }, 0)
                }, 0)
            }, 0)

            return {
                name: estado.nombre,
                code: estado.codigo,
                colonies: countColoniasEnEstado(estado.id),
                families,
                persons,
                coverage: persons === 0 ? '0%' : `${Math.round((puedenVotar / persons) * 100)}%`,
                coloniesTrend: 2,
                familiesTrend: 4,
                personsTrend: 3,
                coverageTrend: 1,
                delegations: delegacionesEstado.map((delegacion) => ({
                    name: delegacion.nombre,
                    colonies: coloniasByDelegacion(delegacion.id).length,
                    families: countFamiliasEnDelegacion(delegacion.id),
                })),
            }
        })
    },

    createState: async (stateData) => {
        return runMock(() => createRecord(estados, { codigo: stateData.codigo, nombre: stateData.nombre }))
    },

    updateState: async (stateId, stateData) => {
        return runMock(() => updateRecord(estados, stateId, stateData))
    },

    deleteState: async (stateId) => {
        return runMock(() => deleteRecord(estados, stateId))
    },

    // ==================== DELEGACIONES ====================

    getDelegationsByState: async (stateId) => {
        return runMock(() => delegacionesByEstado(stateId))
    },

    getAllDelegations: async () => {
        return runMock(() => delegaciones)
    },

    getDelegationById: async (delegationId) => {
        return runMock(() => findById(delegaciones, delegationId))
    },

    createDelegation: async (delegationData) => {
        return runMock(() => createRecord(delegaciones, delegationData))
    },

    updateDelegation: async (delegationId, delegationData) => {
        return runMock(() => updateRecord(delegaciones, delegationId, delegationData))
    },

    deleteDelegation: async (delegationId) => {
        return runMock(() => deleteRecord(delegaciones, delegationId))
    },

    // ==================== COLONIAS ====================

    getColoniesByDelegation: async (delegationId) => {
        return runMock(() => coloniasByDelegacion(delegationId))
    },

    getAllColonies: async () => {
        return runMock(() => colonias)
    },

    createColony: async (colonyData) => {
        return runMock(() => createRecord(colonias, colonyData))
    },

    updateColony: async (colonyId, colonyData) => {
        return runMock(() => updateRecord(colonias, colonyId, colonyData))
    },

    deleteColony: async (colonyId) => {
        return runMock(() => deleteRecord(colonias, colonyId))
    },

    // ==================== FAMILIAS ====================

    getAllFamilies: async (filters = {}) => {
        return runMock(() => {
            let result = familias
            if (filters.colonia_id) {
                result = result.filter((f) => String(f.id_colonia) === String(filters.colonia_id))
            }
            if (filters.estado_familia) {
                result = result.filter((f) => f.estado_familia === filters.estado_familia)
            }
            return result
        })
    },

    getFamilyById: async (familyId) => {
        return runMock(() => {
            const familia = findById(familias, familyId)
            return { ...familia, personas: personasByFamilia(familia.id) }
        })
    },

    createFamily: async (familyData) => {
        return runMock(() => createRecord(familias, familyData))
    },

    updateFamily: async (familyId, familyData) => {
        return runMock(() => updateRecord(familias, familyId, familyData))
    },

    deleteFamily: async (familyId) => {
        return runMock(() => deleteRecord(familias, familyId))
    },

    // ==================== PERSONAS ====================

    getAllPersons: async (filters = {}) => {
        return runMock(() => {
            let result = personas
            if (filters.familia_id) {
                result = result.filter((p) => String(p.id_familia) === String(filters.familia_id))
            }
            if (filters.puede_votar !== undefined) {
                result = result.filter((p) => String(p.puede_votar) === String(filters.puede_votar))
            }
            if (filters.limit) {
                result = result.slice(0, parseInt(filters.limit, 10))
            }
            return result
        })
    },

    getPersonById: async (personId) => {
        return runMock(() => findById(personas, personId))
    },

    createPerson: async (personData) => {
        return runMock(() => createRecord(personas, personData))
    },

    updatePerson: async (personId, personData) => {
        return runMock(() => updateRecord(personas, personId, personData))
    },

    deletePerson: async (personId) => {
        return runMock(() => deleteRecord(personas, personId))
    },

    // ==================== BÚSQUEDA ====================

    search: async (searchTerm) => {
        return runMock(() => {
            const term = String(searchTerm || '').toLowerCase()
            if (!term) return []
            return personas.filter((p) =>
                p.curp.toLowerCase().includes(term) ||
                `${p.nombre} ${p.apellidos}`.toLowerCase().includes(term) ||
                p.telefono.includes(term) ||
                (p.direccion || '').toLowerCase().includes(term)
            )
        })
    },

    searchByCurp: async (curp) => {
        return runMock(() => {
            const persona = personas.find((p) => p.curp.toLowerCase() === String(curp).toLowerCase())
            if (!persona) throw new Error('No se encontró ninguna persona con ese CURP')
            return persona
        })
    },

    // ==================== REPORTES ====================

    generateStateReport: async (stateId) => {
        return runMock(() => {
            const estado = findById(estados, stateId)
            return {
                estado: estado.nombre,
                families: countFamiliasEnEstado(estado.id),
                persons: countPersonasEnEstado(estado.id),
                generado: new Date().toISOString(),
            }
        })
    },

    generateDelegationReport: async (delegationId) => {
        return runMock(() => {
            const delegacion = findById(delegaciones, delegationId)
            return {
                delegacion: delegacion.nombre,
                families: countFamiliasEnDelegacion(delegacion.id),
                persons: countPersonasEnDelegacion(delegacion.id),
                generado: new Date().toISOString(),
            }
        })
    },

    exportToCSV: async (type, id) => {
        return runMock(() => ({ type, id, mensaje: 'Exportación simulada (sin backend real)' }))
    },

    // ==================== ESTADÍSTICAS AVANZADAS ====================

    getCoverageAnalytics: async () => {
        return runMock(() =>
            estados.map((estado) => {
                const persons = countPersonasEnEstado(estado.id)
                return {
                    estado: estado.nombre,
                    families: countFamiliasEnEstado(estado.id),
                    persons,
                }
            })
        )
    },

    getGrowthTrends: async (period = 'monthly') => {
        return runMock(() => ({
            period,
            trend: [4, 6, 5, 8, 7, 9],
        }))
    },

}

export default ElectoralApi
