const { readPool, writePool } = require('../../config/database');
const { mainCache } = require('../../config/cache');
const cryptoService = require('./CryptoService');
const { PAGINATION, CACHE_TTL } = require('../../config/constants');

/**
 * ============================================
 * BASE SERVICE
 * Clase base para todos los servicios
 * ============================================
 *
 * Proporciona funcionalidades comunes:
 * - CRUD básico
 * - Paginación
 * - Caché automático
 * - Cifrado/descifrado
 * - Queries optimizadas
 */

class BaseService {
  constructor(tableName, encryptedFields = []) {
    this.tableName = tableName;
    this.encryptedFields = encryptedFields;
    this.readPool = readPool;
    this.writePool = writePool;
    this.cache = mainCache;
    this.cryptoService = cryptoService;
  }

  /**
   * ============================================
   * OPERACIONES CRUD BÁSICAS
   * ============================================
   */

  /**
   * Obtener todos los registros con paginación
   */
  async getAll(options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      orderBy = 'id',
      orderDirection = 'ASC',
      where = '',
      params = [],
    } = options;

    const offset = (page - 1) * limit;
    const cacheKey = `${this.tableName}:all:${page}:${limit}:${orderBy}:${orderDirection}:${where}`;

    // Intentar obtener del caché
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Query para datos
      const whereClause = where ? `WHERE ${where}` : '';
      const sql = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT ? OFFSET ?
      `;

      const [rows] = await this.readPool.query(sql, [...params, limit, offset]);

      // Query para total
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const [countResult] = await this.readPool.query(countSql, params);
      const total = countResult[0].total;

      // Descifrar campos si es necesario
      const decryptedRows = await this.decryptRows(rows);

      const result = {
        data: decryptedRows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Guardar en caché
      this.cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

      return result;
    } catch (error) {
      console.error(`Error in ${this.tableName}.getAll:`, error);
      throw error;
    }
  }

  /**
   * Obtener un registro por ID
   */
  async getById(id) {
    const cacheKey = `${this.tableName}:${id}`;

    // Intentar obtener del caché
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
      const [rows] = await this.readPool.query(sql, [id]);

      if (rows.length === 0) {
        return null;
      }

      // Descifrar campos si es necesario
      const decrypted = await this.decryptRow(rows[0]);

      // Guardar en caché
      this.cache.set(cacheKey, decrypted, CACHE_TTL.MEDIUM);

      return decrypted;
    } catch (error) {
      console.error(`Error in ${this.tableName}.getById:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(data) {
    try {
      // Cifrar campos sensibles
      const encryptedData = await this.encryptData(data);

      // Preparar campos y valores
      const fields = Object.keys(encryptedData);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(encryptedData);

      const sql = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      const [result] = await this.writePool.query(sql, values);

      // Invalidar caché
      this.invalidateCache();

      // Retornar el registro creado
      return await this.getById(result.insertId);
    } catch (error) {
      console.error(`Error in ${this.tableName}.create:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un registro
   */
  async update(id, data) {
    try {
      // Cifrar campos sensibles
      const encryptedData = await this.encryptData(data);

      // Preparar SET clause
      const fields = Object.keys(encryptedData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(encryptedData), id];

      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.writePool.query(sql, values);

      // Invalidar caché
      this.invalidateCache();
      this.cache.del(`${this.tableName}:${id}`);

      // Retornar el registro actualizado
      return await this.getById(id);
    } catch (error) {
      console.error(`Error in ${this.tableName}.update:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un registro (soft delete)
   */
  async delete(id) {
    try {
      const sql = `
        UPDATE ${this.tableName}
        SET activo = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.writePool.query(sql, [id]);

      // Invalidar caché
      this.invalidateCache();
      this.cache.del(`${this.tableName}:${id}`);

      return true;
    } catch (error) {
      console.error(`Error in ${this.tableName}.delete:`, error);
      throw error;
    }
  }

  /**
   * Eliminar permanentemente
   */
  async hardDelete(id) {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      await this.writePool.query(sql, [id]);

      // Invalidar caché
      this.invalidateCache();
      this.cache.del(`${this.tableName}:${id}`);

      return true;
    } catch (error) {
      console.error(`Error in ${this.tableName}.hardDelete:`, error);
      throw error;
    }
  }

  /**
   * ============================================
   * CIFRADO/DESCIFRADO
   * ============================================
   */

  /**
   * Cifrar datos antes de guardar
   */
  async encryptData(data) {
    if (this.encryptedFields.length === 0) {
      return data;
    }

    const encrypted = { ...data };

    for (const field of this.encryptedFields) {
      if (data[field]) {
        const result = await this.cryptoService.encrypt(data[field]);
        encrypted[`${field}_encrypted`] = result.encrypted;
        encrypted[`${field}_iv`] = result.iv;
        encrypted[`${field}_tag`] = result.authTag;
        delete encrypted[field]; // Eliminar campo sin cifrar
      }
    }

    return encrypted;
  }

  /**
   * Descifrar una fila
   */
  async decryptRow(row) {
    if (!row || this.encryptedFields.length === 0) {
      return row;
    }

    const decrypted = { ...row };

    for (const field of this.encryptedFields) {
      const encryptedField = `${field}_encrypted`;
      const ivField = `${field}_iv`;
      const tagField = `${field}_tag`;

      if (row[encryptedField] && row[ivField] && row[tagField]) {
        try {
          decrypted[field] = await this.cryptoService.decrypt({
            encrypted: row[encryptedField],
            iv: row[ivField],
            authTag: row[tagField],
          });

          // Eliminar campos cifrados del resultado
          delete decrypted[encryptedField];
          delete decrypted[ivField];
          delete decrypted[tagField];
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error.message);
          decrypted[field] = '[ENCRYPTED]';
        }
      }
    }

    return decrypted;
  }

  /**
   * Descifrar múltiples filas
   */
  async decryptRows(rows) {
    if (!rows || rows.length === 0) {
      return rows;
    }

    return Promise.all(rows.map(row => this.decryptRow(row)));
  }

  /**
   * ============================================
   * BÚSQUEDA Y FILTROS
   * ============================================
   */

  /**
   * Buscar registros
   */
  async search(searchTerm, searchFields = [], options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = options;

    const offset = (page - 1) * limit;

    try {
      // Para campos cifrados, necesitamos buscar de forma diferente
      // Obtenemos todos los registros y filtramos en memoria
      if (this.encryptedFields.some(f => searchFields.includes(f))) {
        return await this.searchEncrypted(searchTerm, searchFields, options);
      }

      // Búsqueda normal para campos no cifrados
      const conditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
      const params = searchFields.map(() => `%${searchTerm}%`);

      const sql = `
        SELECT * FROM ${this.tableName}
        WHERE ${conditions}
        LIMIT ? OFFSET ?
      `;

      const [rows] = await this.readPool.query(sql, [...params, limit, offset]);

      // Contar total
      const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE ${conditions}`;
      const [countResult] = await this.readPool.query(countSql, params);
      const total = countResult[0].total;

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`Error in ${this.tableName}.search:`, error);
      throw error;
    }
  }

  /**
   * Búsqueda en campos cifrados (descifrar en memoria)
   */
  async searchEncrypted(searchTerm, searchFields, options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
    } = options;

    try {
      // Obtener todos los registros activos
      const sql = `SELECT * FROM ${this.tableName} WHERE activo = 1`;
      const [rows] = await this.readPool.query(sql);

      // Descifrar y filtrar en memoria
      const decryptedRows = await this.decryptRows(rows);
      const searchLower = searchTerm.toLowerCase();

      const filtered = decryptedRows.filter(row => {
        return searchFields.some(field => {
          const value = row[field];
          if (!value) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });

      // Aplicar paginación
      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`Error in ${this.tableName}.searchEncrypted:`, error);
      throw error;
    }
  }

  /**
   * ============================================
   * UTILIDADES
   * ============================================
   */

  /**
   * Invalidar caché de la tabla
   */
  invalidateCache() {
    const keys = this.cache.keys();
    const tableKeys = keys.filter(key => key.startsWith(`${this.tableName}:`));
    tableKeys.forEach(key => this.cache.del(key));
  }

  /**
   * Contar registros
   */
  async count(where = '', params = []) {
    try {
      const whereClause = where ? `WHERE ${where}` : '';
      const sql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
      const [result] = await this.readPool.query(sql, params);
      return result[0].total;
    } catch (error) {
      console.error(`Error in ${this.tableName}.count:`, error);
      throw error;
    }
  }

  /**
   * Verificar si existe
   */
  async exists(id) {
    try {
      const sql = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`;
      const [rows] = await this.readPool.query(sql, [id]);
      return rows.length > 0;
    } catch (error) {
      console.error(`Error in ${this.tableName}.exists:`, error);
      throw error;
    }
  }

  /**
   * Ejecutar query personalizada
   */
  async query(sql, params = [], useWritePool = false) {
    try {
      const pool = useWritePool ? this.writePool : this.readPool;
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error(`Error in ${this.tableName}.query:`, error);
      throw error;
    }
  }
}

module.exports = BaseService;
