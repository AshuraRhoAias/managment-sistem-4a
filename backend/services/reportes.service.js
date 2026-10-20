/**
 * ============================================
 * SERVICIO: REPORTES, BÚSQUEDA Y EXPORTACIÓN
 * Los datos sensibles están cifrados en la BD, por eso
 * la búsqueda se hace sobre los registros ya descifrados.
 * ============================================
 */

const personasService = require('./personas.service');
const familiasService = require('./familias.service');
const estadosService = require('./estados.service');
const delegacionesService = require('./delegaciones.service');
const coloniasService = require('./colonias.service');
const { toCsv } = require('../utils/csv');

const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 50;

const EXPORT_TYPES = ['families', 'persons'];

class ReportesService {
  /**
   * Buscar personas por CURP, nombre, teléfono o dirección de su familia
   */
  async searchPersonas(term, limit = MAX_SEARCH_RESULTS) {
    const query = String(term || '').trim().toLowerCase();

    if (query.length < MIN_SEARCH_LENGTH) {
      throw new Error(`El término de búsqueda debe tener al menos ${MIN_SEARCH_LENGTH} caracteres`);
    }

    const [personas, familias] = await Promise.all([
      personasService.getAllPersonas(),
      familiasService.getAllFamilias(),
    ]);
    const familiaPorId = new Map(familias.map((f) => [String(f.id), f]));

    return personas
      .map((persona) => {
        const familia = familiaPorId.get(String(persona.id_familia));
        return {
          ...persona,
          familia: familia ? familia.nombre_familia : '',
          direccion: familia ? familia.direccion : '',
        };
      })
      .filter((p) =>
        [p.curp, p.nombre, p.telefono, p.direccion].some((field) =>
          String(field || '').toLowerCase().includes(query)
        )
      )
      .slice(0, limit);
  }

  /**
   * Exportar a CSV. type: 'families' | 'persons'
   */
  async exportCsv(type) {
    if (!EXPORT_TYPES.includes(type)) {
      throw new Error(`Tipo de exportación no válido. Usa: ${EXPORT_TYPES.join(', ')}`);
    }

    const date = new Date().toISOString().slice(0, 10);
    const filename = `${type}-${date}.csv`;

    if (type === 'persons') {
      const personas = await personasService.getAllPersonas();
      const csv = toCsv(personas, [
        { header: 'ID', key: 'id' },
        { header: 'Nombre', key: 'nombre' },
        { header: 'CURP', key: 'curp' },
        { header: 'Teléfono', key: 'telefono' },
        { header: 'Edad', key: 'edad' },
        { header: 'Género', key: 'genero' },
        { header: 'Rol', key: 'rol_familia' },
        { header: 'Puede votar', value: (p) => (p.puede_votar ? 'Sí' : 'No') },
      ]);
      return { filename, csv };
    }

    const [familias, personas, colonias, delegaciones, estados] = await Promise.all([
      familiasService.getAllFamilias(),
      personasService.getAllPersonas(),
      coloniasService.getAllColonias(),
      delegacionesService.getAllDelegaciones(),
      estadosService.getAllEstados(),
    ]);

    const byId = (rows) => new Map(rows.map((r) => [String(r.id), r]));
    const coloniaPorId = byId(colonias);
    const delegacionPorId = byId(delegaciones);
    const estadoPorId = byId(estados);

    const miembros = new Map();
    personas.forEach((p) => {
      const key = String(p.id_familia);
      if (!miembros.has(key)) miembros.set(key, []);
      miembros.get(key).push(p);
    });

    const rows = familias.map((familia) => {
      const colonia = coloniaPorId.get(String(familia.id_colonia));
      const delegacion = colonia && delegacionPorId.get(String(colonia.id_delegacion));
      const estado = delegacion && estadoPorId.get(String(delegacion.id_estado));
      const gente = miembros.get(String(familia.id)) || [];
      const jefe = gente.find((p) => String(p.rol_familia).toUpperCase() === 'JEFE DE FAMILIA') || gente[0];

      return {
        id: familia.id,
        name: familia.nombre_familia,
        jefe: jefe ? jefe.nombre : '',
        state: estado ? estado.nombre : '',
        delegation: delegacion ? delegacion.nombre : '',
        colony: colonia ? colonia.nombre : '',
        address: familia.direccion,
        persons: gente.length,
        status: familia.estado,
      };
    });

    const csv = toCsv(rows, [
      { header: 'ID', key: 'id' },
      { header: 'Familia', key: 'name' },
      { header: 'Jefe de familia', key: 'jefe' },
      { header: 'Estado', key: 'state' },
      { header: 'Delegación', key: 'delegation' },
      { header: 'Colonia', key: 'colony' },
      { header: 'Dirección', key: 'address' },
      { header: 'Personas', key: 'persons' },
      { header: 'Situación', key: 'status' },
    ]);

    return { filename, csv };
  }
}

module.exports = new ReportesService();
module.exports.EXPORT_TYPES = EXPORT_TYPES;
