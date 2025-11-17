/**
 * ============================================
 * SERVICIO: DELEGACIONES
 * Manejo completo de delegaciones con cifrado
 * ============================================
 */

const { readPool, writePool } = require('../config/database');
const cryptoService = require('./base/CryptoService');

class DelegacionesService {
  /**
   * Obtener todas las delegaciones
   */
  async getAllDelegaciones() {
    try {
      const [delegaciones] = await readPool.query(
        'SELECT * FROM delegaciones WHERE activo = 1 ORDER BY id'
      );

      return await this._descifrarDelegaciones(delegaciones);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener delegación por ID
   */
  async getDelegacionById(delegacionId) {
    try {
      const [delegaciones] = await readPool.query(
        'SELECT * FROM delegaciones WHERE id = ? AND activo = 1',
        [delegacionId]
      );

      if (delegaciones.length === 0) {
        throw new Error('Delegación no encontrada');
      }

      const descifradas = await this._descifrarDelegaciones([delegaciones[0]]);
      return descifradas[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener delegaciones por estado
   */
  async getDelegacionesByEstado(estadoId) {
    try {
      const [delegaciones] = await readPool.query(
        'SELECT * FROM delegaciones WHERE id_estado = ? AND activo = 1 ORDER BY id',
        [estadoId]
      );

      return await this._descifrarDelegaciones(delegaciones);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nueva delegación
   */
  async createDelegacion(delegacionData, userId) {
    try {
      const { id_estado, nombre } = delegacionData;

      if (!id_estado || !nombre) {
        throw new Error('Estado y nombre son requeridos');
      }

      const nombreCifrado = await cryptoService.encrypt(nombre);

      const [result] = await writePool.query(
        `INSERT INTO delegaciones (
          id_estado,
          nombre_encrypted, nombre_iv, nombre_tag
        ) VALUES (?, ?, ?, ?)`,
        [
          id_estado,
          nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag
        ]
      );

      return {
        id: result.insertId,
        id_estado,
        nombre,
        message: 'Delegación creada exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar delegación
   */
  async updateDelegacion(delegacionId, delegacionData, userId) {
    try {
      const { nombre, id_estado } = delegacionData;

      await this.getDelegacionById(delegacionId);

      const updates = [];
      const values = [];

      if (nombre) {
        const nombreCifrado = await cryptoService.encrypt(nombre);
        updates.push('nombre_encrypted = ?', 'nombre_iv = ?', 'nombre_tag = ?');
        values.push(nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag);
      }

      if (id_estado) {
        updates.push('id_estado = ?');
        values.push(id_estado);
      }

      if (updates.length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      updates.push('updated_at = NOW()');
      values.push(delegacionId);

      await writePool.query(
        `UPDATE delegaciones SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getDelegacionById(delegacionId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar delegación (soft delete)
   */
  async deleteDelegacion(delegacionId, userId) {
    try {
      await this.getDelegacionById(delegacionId);

      const [colonias] = await readPool.query(
        'SELECT COUNT(*) as count FROM colonias WHERE id_delegacion = ? AND activo = 1',
        [delegacionId]
      );

      if (colonias[0].count > 0) {
        throw new Error('No se puede eliminar una delegación con colonias asociadas');
      }

      await writePool.query(
        'UPDATE delegaciones SET activo = 0, updated_at = NOW() WHERE id = ?',
        [delegacionId]
      );

      return { message: 'Delegación eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Descifrar delegaciones
   */
  async _descifrarDelegaciones(delegaciones) {
    const descifradas = await Promise.all(
      delegaciones.map(async (deleg) => {
        try {
          const nombre = await cryptoService.decrypt({
            encrypted: deleg.nombre_encrypted,
            iv: deleg.nombre_iv,
            authTag: deleg.nombre_tag
          });

          return {
            id: deleg.id,
            id_estado: deleg.id_estado,
            nombre,
            activo: deleg.activo,
            created_at: deleg.created_at,
            updated_at: deleg.updated_at
          };
        } catch (err) {
          console.error(`Error descifrando delegación ${deleg.id}:`, err);
          return null;
        }
      })
    );

    return descifradas.filter(d => d !== null);
  }
}

module.exports = new DelegacionesService();
