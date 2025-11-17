/**
 * ============================================
 * SERVICIO: ESTADOS
 * Manejo completo de estados con cifrado
 * ============================================
 */

const { readPool, writePool } = require('../config/database');
const cryptoService = require('./base/CryptoService');

class EstadosService {
  /**
   * Obtener todos los estados (descifrados)
   */
  async getAllEstados() {
    try {
      const [estados] = await readPool.query(
        'SELECT * FROM estados WHERE activo = 1 ORDER BY id'
      );

      // Descifrar todos los estados
      const estadosDescifrados = await Promise.all(
        estados.map(async (estado) => {
          try {
            const codigo = await cryptoService.decrypt({
              encrypted: estado.codigo_encrypted,
              iv: estado.codigo_iv,
              authTag: estado.codigo_tag
            });

            const nombre = await cryptoService.decrypt({
              encrypted: estado.nombre_encrypted,
              iv: estado.nombre_iv,
              authTag: estado.nombre_tag
            });

            return {
              id: estado.id,
              codigo,
              nombre,
              activo: estado.activo,
              created_at: estado.created_at,
              updated_at: estado.updated_at
            };
          } catch (err) {
            console.error(`Error descifrando estado ${estado.id}:`, err);
            return null;
          }
        })
      );

      return estadosDescifrados.filter(e => e !== null);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estado por ID (descifrado)
   */
  async getEstadoById(estadoId) {
    try {
      const [estados] = await readPool.query(
        'SELECT * FROM estados WHERE id = ? AND activo = 1',
        [estadoId]
      );

      if (estados.length === 0) {
        throw new Error('Estado no encontrado');
      }

      const estado = estados[0];

      const codigo = await cryptoService.decrypt({
        encrypted: estado.codigo_encrypted,
        iv: estado.codigo_iv,
        authTag: estado.codigo_tag
      });

      const nombre = await cryptoService.decrypt({
        encrypted: estado.nombre_encrypted,
        iv: estado.nombre_iv,
        authTag: estado.nombre_tag
      });

      return {
        id: estado.id,
        codigo,
        nombre,
        activo: estado.activo,
        created_at: estado.created_at,
        updated_at: estado.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear nuevo estado (cifrado)
   */
  async createEstado(estadoData, userId) {
    try {
      const { codigo, nombre } = estadoData;

      // Validar datos requeridos
      if (!codigo || !nombre) {
        throw new Error('Código y nombre son requeridos');
      }

      // Cifrar datos
      const codigoCifrado = await cryptoService.encrypt(codigo.toUpperCase());
      const nombreCifrado = await cryptoService.encrypt(nombre);

      // Insertar en BD
      const [result] = await writePool.query(
        `INSERT INTO estados (
          codigo_encrypted, codigo_iv, codigo_tag,
          nombre_encrypted, nombre_iv, nombre_tag,
          activo
        ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          codigoCifrado.encrypted, codigoCifrado.iv, codigoCifrado.authTag,
          nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag
        ]
      );

      return {
        id: result.insertId,
        codigo,
        nombre,
        message: 'Estado creado exitosamente'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar estado existente
   */
  async updateEstado(estadoId, estadoData, userId) {
    try {
      const { codigo, nombre } = estadoData;

      // Verificar que el estado existe
      await this.getEstadoById(estadoId);

      // Construir query dinámicamente
      const updates = [];
      const values = [];

      if (codigo) {
        const codigoCifrado = await cryptoService.encrypt(codigo.toUpperCase());
        updates.push('codigo_encrypted = ?', 'codigo_iv = ?', 'codigo_tag = ?');
        values.push(codigoCifrado.encrypted, codigoCifrado.iv, codigoCifrado.authTag);
      }

      if (nombre) {
        const nombreCifrado = await cryptoService.encrypt(nombre);
        updates.push('nombre_encrypted = ?', 'nombre_iv = ?', 'nombre_tag = ?');
        values.push(nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag);
      }

      if (updates.length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      updates.push('updated_at = NOW()');
      values.push(estadoId);

      await writePool.query(
        `UPDATE estados SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getEstadoById(estadoId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar estado (soft delete)
   */
  async deleteEstado(estadoId, userId) {
    try {
      // Verificar que el estado existe
      await this.getEstadoById(estadoId);

      // Verificar si tiene delegaciones asociadas
      const [delegaciones] = await readPool.query(
        'SELECT COUNT(*) as count FROM delegaciones WHERE id_estado = ? AND activo = 1',
        [estadoId]
      );

      if (delegaciones[0].count > 0) {
        throw new Error('No se puede eliminar un estado con delegaciones asociadas');
      }

      // Soft delete
      await writePool.query(
        'UPDATE estados SET activo = 0, updated_at = NOW() WHERE id = ?',
        [estadoId]
      );

      return { message: 'Estado eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener delegaciones de un estado
   */
  async getDelegacionesByEstado(estadoId) {
    try {
      const [delegaciones] = await readPool.query(
        'SELECT * FROM delegaciones WHERE id_estado = ? AND activo = 1 ORDER BY id',
        [estadoId]
      );

      // Descifrar delegaciones
      const delegacionesDescifradas = await Promise.all(
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

      return delegacionesDescifradas.filter(d => d !== null);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new EstadosService();
