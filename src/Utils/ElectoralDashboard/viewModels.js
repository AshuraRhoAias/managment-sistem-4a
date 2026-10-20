// ============================================
// 🧮 VIEW MODELS
//
// Funciones puras que convierten las tablas "crudas" del backend
// ({ estados, delegaciones, colonias, familias, personas }) en las formas
// que consume la UI. Son las mismas para el modo mock y el modo real,
// así que cualquier pantalla se comporta igual con ambas fuentes de datos.
// ============================================

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAY_MS = 24 * 60 * 60 * 1000

const group = (rows, key) => {
    const map = new Map()
    rows.forEach((row) => {
        const k = String(row[key])
        if (!map.has(k)) map.set(k, [])
        map.get(k).push(row)
    })
    return map
}

const titleCase = (value = '') =>
    String(value).toLowerCase().replace(/^\p{L}/u, (c) => c.toUpperCase())

const percent = (part, total) => (total === 0 ? 0 : Math.round((part / total) * 100))

const toBool = (value) => value === true || value === 1 || value === '1'

const toDate = (value) => {
    const date = value ? new Date(value) : null
    return date && !Number.isNaN(date.getTime()) ? date : null
}

// Crecimiento de los últimos 30 días respecto a lo que existía antes (en %)
const recentGrowth = (rows) => {
    const limit = Date.now() - 30 * DAY_MS
    const recent = rows.filter((row) => (toDate(row.created_at)?.getTime() ?? 0) >= limit).length
    return percent(recent, Math.max(1, rows.length - recent))
}

export const relativeTime = (value) => {
    const date = toDate(value)
    if (!date) return 'Hace poco'
    const days = Math.floor((Date.now() - date.getTime()) / DAY_MS)
    if (days <= 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 30) return `Hace ${days} días`
    const months = Math.floor(days / 30)
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`
}

// ==================== ÍNDICE ====================
export function createIndex(tables) {
    const { estados = [], delegaciones = [], colonias = [], familias = [], personas = [] } = tables

    const delegacionesPorEstado = group(delegaciones, 'id_estado')
    const coloniasPorDelegacion = group(colonias, 'id_delegacion')
    const familiasPorColonia = group(familias, 'id_colonia')
    const personasPorFamilia = group(personas, 'id_familia')
    const get = (map, id) => map.get(String(id)) || []

    const byId = (rows) => new Map(rows.map((row) => [String(row.id), row]))
    const estadoPorId = byId(estados)
    const delegacionPorId = byId(delegaciones)
    const coloniaPorId = byId(colonias)

    const delegacionesDe = (estadoId) => get(delegacionesPorEstado, estadoId)
    const coloniasDe = (delegacionId) => get(coloniasPorDelegacion, delegacionId)
    const familiasDe = (coloniaId) => get(familiasPorColonia, coloniaId)
    const personasDe = (familiaId) => get(personasPorFamilia, familiaId)

    const coloniasDeEstado = (estadoId) => delegacionesDe(estadoId).flatMap((d) => coloniasDe(d.id))
    const familiasDeColonias = (cols) => cols.flatMap((c) => familiasDe(c.id))
    const personasDeFamilias = (fams) => fams.flatMap((f) => personasDe(f.id))

    return {
        tables: { estados, delegaciones, colonias, familias, personas },
        estadoPorId,
        delegacionPorId,
        coloniaPorId,
        delegacionesDe,
        coloniasDe,
        familiasDe,
        personasDe,
        coloniasDeEstado,
        familiasDeColonias,
        personasDeFamilias,
        // Ubicación completa de una colonia
        ubicacion(coloniaId) {
            const colonia = coloniaPorId.get(String(coloniaId))
            const delegacion = colonia && delegacionPorId.get(String(colonia.id_delegacion))
            const estado = delegacion && estadoPorId.get(String(delegacion.id_estado))
            return { colonia, delegacion, estado }
        },
    }
}

// ==================== DASHBOARD ====================
export function buildStatsCards(index) {
    const { estados, delegaciones, colonias, familias, personas } = index.tables
    const puedenVotar = personas.filter((p) => toBool(p.puede_votar)).length

    return [
        { title: 'Estados', value: estados.length, subtitle: 'Estados registrados', trend: 0, iconType: 'map' },
        { title: 'Delegaciones', value: delegaciones.length, subtitle: 'Delegaciones/Alcaldías', trend: recentGrowth(delegaciones), iconType: 'map' },
        { title: 'Colonias', value: colonias.length, subtitle: 'Colonias registradas', trend: recentGrowth(colonias), iconType: 'map' },
        { title: 'Familias Registradas', value: familias.length, subtitle: 'Total de familias', trend: recentGrowth(familias), iconType: 'users' },
        { title: 'Personas Empadronadas', value: personas.length, subtitle: 'Total de personas', trend: recentGrowth(personas), iconType: 'usercheck' },
        { title: 'Cobertura', value: `${percent(puedenVotar, personas.length)}%`, subtitle: 'Empadronamiento', trend: 0, iconType: 'chart' },
    ]
}

export function buildStatesList(index) {
    return index.tables.estados.map((estado) => {
        const familias = index.familiasDeColonias(index.coloniasDeEstado(estado.id))
        return {
            id: estado.id,
            name: estado.nombre,
            code: estado.codigo,
            delegations: index.delegacionesDe(estado.id).length,
            families: familias.length,
            persons: index.personasDeFamilias(familias).length,
        }
    })
}

export function buildStateDetail(index, stateId) {
    const estado = index.estadoPorId.get(String(stateId))
    if (!estado) throw new Error('Estado no encontrado')

    const delegaciones = index.delegacionesDe(estado.id)
    const colonias = index.coloniasDeEstado(estado.id)
    const familias = index.familiasDeColonias(colonias)
    const personas = index.personasDeFamilias(familias)
    const puedenVotar = personas.filter((p) => toBool(p.puede_votar)).length

    return {
        name: estado.nombre,
        code: estado.codigo,
        colonies: colonias.length,
        families: familias.length,
        persons: personas.length,
        coverage: `${percent(puedenVotar, personas.length)}%`,
        coloniesTrend: recentGrowth(colonias),
        familiesTrend: recentGrowth(familias),
        personsTrend: recentGrowth(personas),
        coverageTrend: 0,
        delegations: delegaciones.map((delegacion) => {
            const cols = index.coloniasDe(delegacion.id)
            return {
                name: delegacion.nombre,
                colonies: cols.length,
                families: index.familiasDeColonias(cols).length,
            }
        }),
    }
}

// Acumulado de los últimos `months` meses según created_at
export function buildMonthlySummary(index, months = 6) {
    const { familias, personas } = index.tables
    const now = new Date()

    return Array.from({ length: months }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).getTime()
        const upTo = (rows) => rows.filter((r) => (toDate(r.created_at)?.getTime() ?? 0) < endOfMonth)
        const personasHasta = upTo(personas)

        return {
            month: MONTH_LABELS[monthDate.getMonth()],
            familias: upTo(familias).length,
            personas: personasHasta.length,
            votos: personasHasta.filter((p) => toBool(p.puede_votar)).length,
        }
    })
}

export function buildRecentActivity(index, limit = 5) {
    const { familias, personas } = index.tables
    const newest = (rows, n) =>
        [...rows].sort((a, b) => (toDate(b.created_at)?.getTime() ?? 0) - (toDate(a.created_at)?.getTime() ?? 0)).slice(0, n)

    return [
        ...newest(familias, Math.ceil(limit / 2)).map((f) => ({
            title: `Se registró la familia ${f.nombre_familia}`,
            time: relativeTime(f.created_at),
            date: f.created_at,
        })),
        ...newest(personas, Math.floor(limit / 2)).map((p) => ({
            title: `Se empadronó a ${p.nombre}`,
            time: relativeTime(p.created_at),
            date: p.created_at,
        })),
    ]
        .sort((a, b) => (toDate(b.date)?.getTime() ?? 0) - (toDate(a.date)?.getTime() ?? 0))
        .map(({ title, time }) => ({ title, time }))
}

// ==================== BÚSQUEDA ====================
export function searchPersons(index, term) {
    const query = String(term || '').trim().toLowerCase()
    if (!query) return []

    return index.tables.personas
        .map((persona) => {
            const familia = index.tables.familias.find((f) => String(f.id) === String(persona.id_familia))
            const { colonia } = familia ? index.ubicacion(familia.id_colonia) : {}
            return {
                ...persona,
                familia: familia?.nombre_familia || '',
                direccion: familia?.direccion || '',
                colonia: colonia?.nombre || '',
            }
        })
        .filter((p) =>
            [p.curp, p.nombre, p.telefono, p.direccion].some((field) => String(field || '').toLowerCase().includes(query))
        )
}

// ==================== ZONAS ELECTORALES ====================
export function buildColoniasView(index) {
    return index.tables.colonias.map((colonia) => {
        const { delegacion, estado } = index.ubicacion(colonia.id)
        const familias = index.familiasDe(colonia.id)
        const personas = index.personasDeFamilias(familias)

        return {
            id: colonia.id,
            name: colonia.nombre,
            delegation: delegacion?.nombre || '—',
            state: estado?.nombre || '—',
            cp: colonia.codigo_postal || '',
            families: familias.length,
            persons: personas.length,
            coverage: percent(personas.filter((p) => toBool(p.puede_votar)).length, personas.length),
            delegacionId: colonia.id_delegacion,
            estadoId: estado?.id,
        }
    })
}

// ==================== FAMILIAS ====================
export function buildFamiliasView(index) {
    return index.tables.familias.map((familia) => {
        const { colonia, delegacion, estado } = index.ubicacion(familia.id_colonia)
        const members = index.personasDe(familia.id).map((p) => ({
            id: p.id,
            name: p.nombre,
            age: Number(p.edad) || 0,
            gender: titleCase(p.genero),
            role: String(p.rol_familia || 'MIEMBRO').toUpperCase(),
            curp: p.curp || '',
            phone: p.telefono || '',
        }))
        const jefe = members.find((m) => m.role === 'JEFE DE FAMILIA') || members[0]

        return {
            id: familia.id,
            name: familia.nombre_familia,
            jefe: jefe ? jefe.name : '—',
            delegation: delegacion?.nombre || '—',
            colony: colonia?.nombre || '—',
            state: estado?.nombre || '—',
            persons: members.length,
            status: String(familia.estado || 'ACTIVA').toUpperCase() === 'ACTIVA' ? 'Activa' : 'Inactiva',
            address: familia.direccion || '',
            registro: toDate(familia.created_at)?.toISOString().slice(0, 10) || '',
            members,
            coloniaId: familia.id_colonia,
        }
    })
}

// ==================== REPORTES IMPRIMIBLES ====================
export function buildReportFilters(index) {
    const { estados, delegaciones, colonias } = index.tables
    return {
        estados: estados.map((e) => ({ value: String(e.id), label: e.nombre })),
        delegaciones: delegaciones.map((d) => ({ value: String(d.id), label: d.nombre, parent: String(d.id_estado) })),
        colonias: colonias.map((c) => ({ value: String(c.id), label: c.nombre, parent: String(c.id_delegacion) })),
    }
}

const votesLabel = (age) => (age >= 18 ? 'Sí' : age === 17 ? 'Prox. año' : age === 16 ? 'En 2 años' : 'No')

export function buildReport(index, { estadoId = 'all', delegacionId = 'all', coloniaId = 'all' } = {}) {
    const matches = (filter, value) => filter === 'all' || String(filter) === String(value)

    const families = index.tables.familias
        .map((familia) => ({ familia, ...index.ubicacion(familia.id_colonia) }))
        .filter(({ colonia, delegacion, estado }) =>
            colonia && delegacion && estado &&
            matches(estadoId, estado.id) && matches(delegacionId, delegacion.id) && matches(coloniaId, colonia.id)
        )
        .map(({ familia, colonia, delegacion, estado }) => {
            const personas = index.personasDe(familia.id)
            const jefe = personas.find((p) => String(p.rol_familia).toUpperCase() === 'JEFE DE FAMILIA') || personas[0]
            const members = personas.map((p) => ({
                name: p.nombre,
                curp: p.curp,
                age: Number(p.edad) || 0,
                gender: String(p.genero || '').toUpperCase().startsWith('F') ? 'F' : 'M',
                votes: votesLabel(Number(p.edad) || 0),
            }))

            return {
                id: familia.id,
                name: familia.nombre_familia,
                head: jefe ? jefe.nombre : '—',
                colony: colonia.nombre,
                address: [familia.direccion, colonia.nombre, delegacion.nombre, estado.nombre].filter(Boolean).join(', '),
                members,
                summary: {
                    voters: members.filter((m) => m.age >= 18).length,
                    turning18: members.filter((m) => m.age === 17).length,
                    in2years: members.filter((m) => m.age === 16).length,
                },
            }
        })

    return {
        families,
        totals: {
            persons: families.reduce((sum, f) => sum + f.members.length, 0),
            voters: families.reduce((sum, f) => sum + f.summary.voters, 0),
            turning18: families.reduce((sum, f) => sum + f.summary.turning18, 0),
            in2years: families.reduce((sum, f) => sum + f.summary.in2years, 0),
        },
    }
}

// ==================== ANALÍTICA ====================
export function buildCoverageAnalytics(index) {
    return buildStatesList(index).map(({ name, families, persons }) => ({ estado: name, families, persons }))
}
