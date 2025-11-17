/**
 * ============================================
 * SERVICIO: PERSONAS
 * Manejo completo de personas con cifrado total
 * ============================================
 */

const { readPool, writePool } = require('../config/database');
const cryptoService = require('./base/CryptoService');

class PersonasService {
  /**
   * Obtener todas las personas con filtros
   */
  async getAllPersonas(filters = {}) {
    try {
      let query = `
        SELECT p.*, f.id as familia_id
        FROM personas p
        LEFT JOIN familias f ON p.id_familia = f.id
        WHERE p.activo = 1
      `;

      const params = [];

      if (filters.familia_id) {
        query += ' AND p.id_familia = ?';
        params.push(filters.familia_id);
      }

      if (filters.puede_votar !== undefined) {
        query += ' AND p.puede_votar = ?';
        params.push(filters.puede_votar);
      }

      query += ' ORDER BY p.puede_votar DESC, p.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
      }

      const [personas] = await readPool.query(query, params);
      return await this._descifrarPersonas(personas);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener persona por ID
   */
  async getPersonaById(personaId) {
    try {
      const [personas] = await readPool.query(
        'SELECT * FROM personas WHERE id = ? AND activo = 1',
        [personaId]
      );

      if (personas.length === 0) {
        throw new Error('Persona no encontrada');
      }

      const descifradas = await this._descifrarPersonas([personas[0]]);
      return descifradas[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar persona por CURP
   */
  async searchByCurp(curp) {
    try {
      const [personas] = await readPool.query(
        'SELECT * FROM personas WHERE activo = 1'
      );

      // Descifrar y buscar
      for (const persona of personas) {
        try {
          const curpDescifrada = await cryptoService.decrypt({
            encrypted: persona.curp_encrypted,
            iv: persona.curp_iv,
            authTag: persona.curp_tag
          });

          if (curpDescifrada === curp.toUpperCase()) {
            const descifradas = await this._descifrarPersonas([persona]);
            return descifradas[0];
          }
        } catch (err) {
          continue;
        }
      }

      throw new Error('Persona no encontrada con ese CURP');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nueva persona
   */
  async createPersona(personaData, userId) {
    try {
      const {
        id_familia,
        nombre,
        curp,
        telefono,
        edad,
        genero,
        fecha_nacimiento,
        rol_familia,
        notas
      } = personaData;

      // Validaciones
      if (!id_familia || !nombre || !curp || !edad || !genero || !rol_familia) {
        throw new Error('Familia, nombre, CURP, edad, género y rol son requeridos');
      }

      // Calcular si puede votar
      const edadNum = parseInt(edad);
      const puede_votar = edadNum >= 18 ? 1 : 0;

      // Cifrar todos los campos
      const nombreCifrado = await cryptoService.encrypt(nombre);
      const curpCifrada = await cryptoService.encrypt(curp.toUpperCase());
      const edadCifrada = await cryptoService.encrypt(edad.toString());
      const generoCifrado = await cryptoService.encrypt(genero.toUpperCase());
      const rolCifrado = await cryptoService.encrypt(rol_familia.toUpperCase());

      const fields = [
        'id_familia',
        'nombre_encrypted', 'nombre_iv', 'nombre_tag',
        'curp_encrypted', 'curp_iv', 'curp_tag',
        'edad_encrypted', 'edad_iv', 'edad_tag',
        'genero_encrypted', 'genero_iv', 'genero_tag',
        'rol_familia_encrypted', 'rol_familia_iv', 'rol_familia_tag',
        'puede_votar',
        'id_registro'
      ];

      const values = [
        id_familia,
        nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag,
        curpCifrada.encrypted, curpCifrada.iv, curpCifrada.authTag,
        edadCifrada.encrypted, edadCifrada.iv, edadCifrada.authTag,
        generoCifrado.encrypted, generoCifrado.iv, generoCifrado.authTag,
        rolCifrado.encrypted, rolCifrado.iv, rolCifrado.authTag,
        puede_votar,
        userId
      ];

      // Campos opcionales
      if (telefono) {
        const telefonoCifrado = await cryptoService.encrypt(telefono);
        fields.push('telefono_encrypted', 'telefono_iv', 'telefono_tag');
        values.push(telefonoCifrado.encrypted, telefonoCifrado.iv, telefonoCifrado.authTag);
      }

      if (fecha_nacimiento) {
        fields.push('fecha_nacimiento');
        values.push(fecha_nacimiento);
      }

      if (notas) {
        const notasCifradas = await cryptoService.encrypt(notas);
        fields.push('notas_encrypted', 'notas_iv', 'notas_tag');
        values.push(notasCifradas.encrypted, notasCifradas.iv, notasCifradas.authTag);
      }

      const [result] = await writePool.query(
        `INSERT INTO personas (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
        values
      );

      return {
        id: result.insertId,
        nombre,
        curp,
        edad: edadNum,
        genero,
        rol_familia,
        puede_votar: puede_votar === 1,
        message: 'Persona creada exitosamente',
        usuario_registro: userId
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar persona existente
   */
  async updatePersona(personaId, personaData, userId) {
    try {
      const {
        nombre,
        curp,
        telefono,
        edad,
        genero,
        fecha_nacimiento,
        rol_familia,
        notas
      } = personaData;

      await this.getPersonaById(personaId);

      const updates = [];
      const values = [];

      if (nombre) {
        const nombreCifrado = await cryptoService.encrypt(nombre);
        updates.push('nombre_encrypted = ?', 'nombre_iv = ?', 'nombre_tag = ?');
        values.push(nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag);
      }

      if (curp) {
        const curpCifrada = await cryptoService.encrypt(curp.toUpperCase());
        updates.push('curp_encrypted = ?', 'curp_iv = ?', 'curp_tag = ?');
        values.push(curpCifrada.encrypted, curpCifrada.iv, curpCifrada.authTag);
      }

      if (telefono !== undefined) {
        if (telefono) {
          const telefonoCifrado = await cryptoService.encrypt(telefono);
          updates.push('telefono_encrypted = ?', 'telefono_iv = ?', 'telefono_tag = ?');
          values.push(telefonoCifrado.encrypted, telefonoCifrado.iv, telefonoCifrado.authTag);
        } else {
          updates.push('telefono_encrypted = NULL', 'telefono_iv = NULL', 'telefono_tag = NULL');
        }
      }

      if (edad) {
        const edadNum = parseInt(edad);
        const edadCifrada = await cryptoService.encrypt(edad.toString());
        updates.push('edad_encrypted = ?', 'edad_iv = ?', 'edad_tag = ?');
        values.push(edadCifrada.encrypted, edadCifrada.iv, edadCifrada.authTag);

        // Actualizar puede_votar
        const puede_votar = edadNum >= 18 ? 1 : 0;
        updates.push('puede_votar = ?');
        values.push(puede_votar);
      }

      if (genero) {
        const generoCifrado = await cryptoService.encrypt(genero.toUpperCase());
        updates.push('genero_encrypted = ?', 'genero_iv = ?', 'genero_tag = ?');
        values.push(generoCifrado.encrypted, generoCifrado.iv, generoCifrado.authTag);
      }

      if (rol_familia) {
        const rolCifrado = await cryptoService.encrypt(rol_familia.toUpperCase());
        updates.push('rol_familia_encrypted = ?', 'rol_familia_iv = ?', 'rol_familia_tag = ?');
        values.push(rolCifrado.encrypted, rolCifrado.iv, rolCifrado.authTag);
      }

      if (fecha_nacimiento) {
        updates.push('fecha_nacimiento = ?');
        values.push(fecha_nacimiento);
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

      if (updates.length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      updates.push('id_ultima_modificacion = ?', 'updated_at = NOW()');
      values.push(userId, personaId);

      await writePool.query(
        `UPDATE personas SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getPersonaById(personaId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar persona (soft delete)
   */
  async deletePersona(personaId, userId) {
    try {
      await this.getPersonaById(personaId);

      await writePool.query(
        'UPDATE personas SET activo = 0, id_ultima_modificacion = ?, updated_at = NOW() WHERE id = ?',
        [userId, personaId]
      );

      return { message: 'Persona eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de personas
   */
  async getStats() {
    try {
      const [stats] = await readPool.query(`
        SELECT
          COUNT(*) as total_personas,
          SUM(puede_votar) as total_votantes
        FROM personas
        WHERE activo = 1
      `);

      return {
        total_personas: stats[0].total_personas,
        total_votantes: stats[0].total_votantes,
        total_no_votantes: stats[0].total_personas - stats[0].total_votantes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Descifrar personas
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

          let notas = null;
          if (persona.notas_encrypted) {
            notas = await cryptoService.decrypt({
              encrypted: persona.notas_encrypted,
              iv: persona.notas_iv,
              authTag: persona.notas_tag
            });
          }

          return {
            id: persona.id,
            id_familia: persona.id_familia,
            nombre,
            curp,
            telefono,
            edad: parseInt(edad),
            genero,
            fecha_nacimiento: persona.fecha_nacimiento,
            rol_familia,
            puede_votar: persona.puede_votar === 1,
            notas,
            id_registro: persona.id_registro,
            id_ultima_modificacion: persona.id_ultima_modificacion,
            created_at: persona.created_at,
            updated_at: persona.updated_at
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

module.exports = new PersonasService();
