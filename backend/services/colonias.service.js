/**
 * ============================================
 * SERVICIO: COLONIAS
 * Manejo completo de colonias con cifrado
 * ============================================
 */

const { readPool, writePool } = require('../config/database');
const cryptoService = require('./base/CryptoService');

class ColoniasService {
  async getAllColonias() {
    try {
      const [colonias] = await readPool.query(
        'SELECT * FROM colonias WHERE activo = 1 ORDER BY id'
      );
      return await this._descifrarColonias(colonias);
    } catch (error) {
      throw error;
    }
  }

  async getColoniaById(coloniaId) {
    try {
      const [colonias] = await readPool.query(
        'SELECT * FROM colonias WHERE id = ? AND activo = 1',
        [coloniaId]
      );

      if (colonias.length === 0) {
        throw new Error('Colonia no encontrada');
      }

      const descifradas = await this._descifrarColonias([colonias[0]]);
      return descifradas[0];
    } catch (error) {
      throw error;
    }
  }

  async getColoniasByDelegacion(delegacionId) {
    try {
      const [colonias] = await readPool.query(
        'SELECT * FROM colonias WHERE id_delegacion = ? AND activo = 1 ORDER BY id',
        [delegacionId]
      );
      return await this._descifrarColonias(colonias);
    } catch (error) {
      throw error;
    }
  }

  async createColonia(coloniaData, userId) {
    try {
      const { id_delegacion, nombre, codigo_postal } = coloniaData;

      if (!id_delegacion || !nombre) {
        throw new Error('Delegación y nombre son requeridos');
      }

      const nombreCifrado = await cryptoService.encrypt(nombre);
      let cpCifrado = null;

      if (codigo_postal) {
        cpCifrado = await cryptoService.encrypt(codigo_postal);
      }

      const fields = [
        'id_delegacion',
        'nombre_encrypted', 'nombre_iv', 'nombre_tag'
      ];
      const values = [
        id_delegacion,
        nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag
      ];

      if (cpCifrado) {
        fields.push('codigo_postal_encrypted', 'codigo_postal_iv', 'codigo_postal_tag');
        values.push(cpCifrado.encrypted, cpCifrado.iv, cpCifrado.authTag);
      }

      const [result] = await writePool.query(
        `INSERT INTO colonias (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
        values
      );

      return {
        id: result.insertId,
        id_delegacion,
        nombre,
        codigo_postal,
        message: 'Colonia creada exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  async updateColonia(coloniaId, coloniaData, userId) {
    try {
      const { nombre, codigo_postal, id_delegacion } = coloniaData;
      await this.getColoniaById(coloniaId);

      const updates = [];
      const values = [];

      if (nombre) {
        const nombreCifrado = await cryptoService.encrypt(nombre);
        updates.push('nombre_encrypted = ?', 'nombre_iv = ?', 'nombre_tag = ?');
        values.push(nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag);
      }

      if (codigo_postal) {
        const cpCifrado = await cryptoService.encrypt(codigo_postal);
        updates.push('codigo_postal_encrypted = ?', 'codigo_postal_iv = ?', 'codigo_postal_tag = ?');
        values.push(cpCifrado.encrypted, cpCifrado.iv, cpCifrado.authTag);
      }

      if (id_delegacion) {
        updates.push('id_delegacion = ?');
        values.push(id_delegacion);
      }

      if (updates.length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      updates.push('updated_at = NOW()');
      values.push(coloniaId);

      await writePool.query(
        `UPDATE colonias SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getColoniaById(coloniaId);
    } catch (error) {
      throw error;
    }
  }

  async deleteColonia(coloniaId, userId) {
    try {
      await this.getColoniaById(coloniaId);

      const [familias] = await readPool.query(
        'SELECT COUNT(*) as count FROM familias WHERE id_colonia = ? AND estado = "ACTIVA"',
        [coloniaId]
      );

      if (familias[0].count > 0) {
        throw new Error('No se puede eliminar una colonia con familias asociadas');
      }

      await writePool.query(
        'UPDATE colonias SET activo = 0, updated_at = NOW() WHERE id = ?',
        [coloniaId]
      );

      return { message: 'Colonia eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async _descifrarColonias(colonias) {
    const descifradas = await Promise.all(
      colonias.map(async (colonia) => {
        try {
          const nombre = await cryptoService.decrypt({
            encrypted: colonia.nombre_encrypted,
            iv: colonia.nombre_iv,
            authTag: colonia.nombre_tag
          });

          let codigo_postal = null;
          if (colonia.codigo_postal_encrypted) {
            codigo_postal = await cryptoService.decrypt({
              encrypted: colonia.codigo_postal_encrypted,
              iv: colonia.codigo_postal_iv,
              authTag: colonia.codigo_postal_tag
            });
          }

          return {
            id: colonia.id,
            id_delegacion: colonia.id_delegacion,
            nombre,
            codigo_postal,
            activo: colonia.activo,
            created_at: colonia.created_at,
            updated_at: colonia.updated_at
          };
        } catch (err) {
          console.error(`Error descifrando colonia ${colonia.id}:`, err);
          return null;
        }
      })
    );

    return descifradas.filter(c => c !== null);
  }
}

module.exports = new ColoniasService();
