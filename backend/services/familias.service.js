/**
 * ============================================
 * SERVICIO: FAMILIAS
 * Manejo completo de familias con cifrado y auditoría
 * ============================================
 */

const { readPool, writePool } = require('../config/database');
const cryptoService = require('./base/CryptoService');

class FamiliasService {
  /**
   * Obtener todas las familias con filtros opcionales
   */
  async getAllFamilias(filters = {}) {
    try {
      let query = `
        SELECT f.*,
          c.id as colonia_id,
          d.id as delegacion_id,
          e.id as estado_id
        FROM familias f
        LEFT JOIN colonias c ON f.id_colonia = c.id
        LEFT JOIN delegaciones d ON c.id_delegacion = d.id
        LEFT JOIN estados e ON d.id_estado = e.id
        WHERE f.estado = 'ACTIVA'
      `;

      const params = [];

      if (filters.colonia_id) {
        query += ' AND f.id_colonia = ?';
        params.push(filters.colonia_id);
      }

      if (filters.estado_familia) {
        query += ' AND f.estado = ?';
        params.push(filters.estado_familia);
      }

      query += ' ORDER BY f.created_at DESC';

      const [familias] = await readPool.query(query, params);
      return await this._descifrarFamilias(familias);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener familia por ID con sus personas
   */
  async getFamiliaById(familiaId) {
    try {
      const [familias] = await readPool.query(
        `SELECT f.*,
          c.id as colonia_id,
          d.id as delegacion_id,
          e.id as estado_id
        FROM familias f
        LEFT JOIN colonias c ON f.id_colonia = c.id
        LEFT JOIN delegaciones d ON c.id_delegacion = d.id
        LEFT JOIN estados e ON d.id_estado = e.id
        WHERE f.id = ? AND f.estado = 'ACTIVA'`,
        [familiaId]
      );

      if (familias.length === 0) {
        throw new Error('Familia no encontrada');
      }

      const familiasDescifradas = await this._descifrarFamilias([familias[0]]);
      const familia = familiasDescifradas[0];

      // Obtener personas de la familia
      const [personas] = await readPool.query(
        'SELECT * FROM personas WHERE id_familia = ? AND activo = 1 ORDER BY puede_votar DESC, created_at',
        [familiaId]
      );

      const personasDescifradas = await this._descifrarPersonas(personas);
      familia.personas = personasDescifradas;
      familia.total_miembros = personasDescifradas.length;
      familia.total_votantes = personasDescifradas.filter(p => p.puede_votar).length;

      return familia;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nueva familia
   */
  async createFamilia(familiaData, userId) {
    try {
      const { id_colonia, nombre_familia, direccion, notas, estado = 'ACTIVA' } = familiaData;

      if (!id_colonia || !nombre_familia || !direccion) {
        throw new Error('Colonia, nombre de familia y dirección son requeridos');
      }

      // Cifrar datos
      const nombreCifrado = await cryptoService.encrypt(nombre_familia);
      const direccionCifrada = await cryptoService.encrypt(direccion);

      const fields = [
        'id_colonia',
        'nombre_familia_encrypted', 'nombre_familia_iv', 'nombre_familia_tag',
        'direccion_encrypted', 'direccion_iv', 'direccion_tag',
        'estado',
        'id_registro'
      ];

      const values = [
        id_colonia,
        nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag,
        direccionCifrada.encrypted, direccionCifrada.iv, direccionCifrada.authTag,
        estado,
        userId
      ];

      // Cifrar notas si existen
      if (notas) {
        const notasCifradas = await cryptoService.encrypt(notas);
        fields.push('notas_encrypted', 'notas_iv', 'notas_tag');
        values.push(notasCifradas.encrypted, notasCifradas.iv, notasCifradas.authTag);
      }

      const [result] = await writePool.query(
        `INSERT INTO familias (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
        values
      );

      return {
        id: result.insertId,
        nombre_familia,
        direccion,
        notas,
        message: 'Familia creada exitosamente',
        usuario_registro: userId
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar familia existente
   */
  async updateFamilia(familiaId, familiaData, userId) {
    try {
      const { nombre_familia, direccion, notas, estado, id_colonia } = familiaData;

      await this.getFamiliaById(familiaId);

      const updates = [];
      const values = [];

      if (nombre_familia) {
        const nombreCifrado = await cryptoService.encrypt(nombre_familia);
        updates.push('nombre_familia_encrypted = ?', 'nombre_familia_iv = ?', 'nombre_familia_tag = ?');
        values.push(nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag);
      }

      if (direccion) {
        const direccionCifrada = await cryptoService.encrypt(direccion);
        updates.push('direccion_encrypted = ?', 'direccion_iv = ?', 'direccion_tag = ?');
        values.push(direccionCifrada.encrypted, direccionCifrada.iv, direccionCifrada.authTag);
      }

      if (notas !== undefined) {
        if (notas) {
          const notasCifradas = await cryptoService.encrypt(notas);
          updates.push('notas_encrypted = ?', 'notas_iv = ?', 'notas_tag = ?');
          values.push(notasCifradas.encrypted, notasCifradas.iv, notasCifradas.authTag);
        } else {
          updates.push('notas_encrypted = NULL', 'notas_iv = NULL', 'notas_tag = NULL');
        }
      }

      if (estado) {
        updates.push('estado = ?');
        values.push(estado);
      }

      if (id_colonia) {
        updates.push('id_colonia = ?');
        values.push(id_colonia);
      }

      if (updates.length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      updates.push('id_ultima_modificacion = ?', 'updated_at = NOW()');
      values.push(userId, familiaId);

      await writePool.query(
        `UPDATE familias SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getFamiliaById(familiaId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar familia (cambiar estado a INACTIVA)
   */
  async deleteFamilia(familiaId, userId) {
    try {
      await this.getFamiliaById(familiaId);

      await writePool.query(
        'UPDATE familias SET estado = "INACTIVA", id_ultima_modificacion = ?, updated_at = NOW() WHERE id = ?',
        [userId, familiaId]
      );

      // También desactivar personas de la familia
      await writePool.query(
        'UPDATE personas SET activo = 0 WHERE id_familia = ?',
        [familiaId]
      );

      return { message: 'Familia eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de una familia
   */
  async getFamiliaStats(familiaId) {
    try {
      const familia = await this.getFamiliaById(familiaId);

      const [stats] = await readPool.query(
        `SELECT
          COUNT(*) as total_personas,
          SUM(puede_votar) as total_votantes,
          COUNT(DISTINCT CASE WHEN genero_encrypted IS NOT NULL THEN 1 END) as total_con_genero
        FROM personas
        WHERE id_familia = ? AND activo = 1`,
        [familiaId]
      );

      return {
        familia: familia.nombre_familia,
        total_personas: stats[0].total_personas,
        total_votantes: stats[0].total_votantes,
        total_no_votantes: stats[0].total_personas - stats[0].total_votantes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Descifrar familias
   */
  async _descifrarFamilias(familias) {
    const descifradas = await Promise.all(
      familias.map(async (familia) => {
        try {
          const nombre_familia = await cryptoService.decrypt({
            encrypted: familia.nombre_familia_encrypted,
            iv: familia.nombre_familia_iv,
            authTag: familia.nombre_familia_tag
          });

          const direccion = await cryptoService.decrypt({
            encrypted: familia.direccion_encrypted,
            iv: familia.direccion_iv,
            authTag: familia.direccion_tag
          });

          let notas = null;
          if (familia.notas_encrypted) {
            notas = await cryptoService.decrypt({
              encrypted: familia.notas_encrypted,
              iv: familia.notas_iv,
              authTag: familia.notas_tag
            });
          }

          return {
            id: familia.id,
            id_colonia: familia.id_colonia,
            nombre_familia,
            direccion,
            notas,
            estado: familia.estado,
            id_registro: familia.id_registro,
            id_ultima_modificacion: familia.id_ultima_modificacion,
            created_at: familia.created_at,
            updated_at: familia.updated_at
          };
        } catch (err) {
          console.error(`Error descifrando familia ${familia.id}:`, err);
          return null;
        }
      })
    );

    return descifradas.filter(f => f !== null);
  }

  /**
   * Helper: Descifrar personas (usado para obtener miembros de familia)
   */
  async _descifrarPersonas(personas) {
    const descifradas = await Promise.all(
      personas.map(async (persona) => {
        try {
          const nombre = await cryptoService.decrypt({
            encrypted: persona.nombre_encrypted,
            iv: persona.nombre_iv,
            authTag: persona.nombre_tag
          });

          const curp = await cryptoService.decrypt({
            encrypted: persona.curp_encrypted,
            iv: persona.curp_iv,
            authTag: persona.curp_tag
          });

          const edad = await cryptoService.decrypt({
            encrypted: persona.edad_encrypted,
            iv: persona.edad_iv,
            authTag: persona.edad_tag
          });

          const genero = await cryptoService.decrypt({
            encrypted: persona.genero_encrypted,
            iv: persona.genero_iv,
            authTag: persona.genero_tag
          });

          const rol_familia = await cryptoService.decrypt({
            encrypted: persona.rol_familia_encrypted,
            iv: persona.rol_familia_iv,
            authTag: persona.rol_familia_tag
          });

          let telefono = null;
          if (persona.telefono_encrypted) {
            telefono = await cryptoService.decrypt({
              encrypted: persona.telefono_encrypted,
              iv: persona.telefono_iv,
              authTag: persona.telefono_tag
            });
          }

          return {
            id: persona.id,
            nombre,
            curp,
            telefono,
            edad: parseInt(edad),
            genero,
            rol_familia,
            puede_votar: persona.puede_votar,
            fecha_nacimiento: persona.fecha_nacimiento
          };
        } catch (err) {
          console.error(`Error descifrando persona ${persona.id}:`, err);
          return null;
        }
      })
    );

    return descifradas.filter(p => p !== null);
  }
}

module.exports = new FamiliasService();
