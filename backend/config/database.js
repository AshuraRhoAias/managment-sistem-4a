const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * CONFIGURACIÓN DE BASE DE DATOS CON DUAL POOL
 * - Pool de Escritura: Operaciones INSERT, UPDATE, DELETE
 * - Pool de Lectura: Operaciones SELECT para mejor rendimiento
 */

// ==================== POOL DE ESCRITURA ====================
const writePool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'dbserverine',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_WRITE_POOL_MAX) || 100,
  queueLimit: 300,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false,
  timezone: '+00:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  decimalNumbers: false,
  trace: process.env.NODE_ENV === 'development',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  namedPlaceholders: true,
});

// ==================== POOL DE LECTURA ====================
const readPool = mysql.createPool({
  host: process.env.DB_READ_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_READ_PORT) || parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_READ_USER || process.env.DB_USER || 'root',
  password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_READ_NAME || process.env.DB_NAME || 'dbserverine',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_READ_POOL_MAX) || 150,
  queueLimit: 500,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false,
  timezone: '+00:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  decimalNumbers: false,
  trace: false,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  namedPlaceholders: true,
});

// ==================== MONITOREO DE CONEXIONES ====================
writePool.on('acquire', (connection) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log('📝 Connection %d acquired (WRITE)', connection.threadId);
  }
});

writePool.on('release', (connection) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log('📝 Connection %d released (WRITE)', connection.threadId);
  }
});

readPool.on('acquire', (connection) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log('📖 Connection %d acquired (READ)', connection.threadId);
  }
});

readPool.on('release', (connection) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log('📖 Connection %d released (READ)', connection.threadId);
  }
});

// ==================== MANEJO DE ERRORES ====================
writePool.on('error', (err) => {
  console.error('❌ MySQL WRITE Pool Error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

readPool.on('error', (err) => {
  console.error('❌ MySQL READ Pool Error:', err);
});

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtener estadísticas del pool
 */
async function getPoolStats() {
  return {
    write: {
      totalConnections: writePool.pool._allConnections.length,
      activeConnections: writePool.pool._allConnections.length - writePool.pool._freeConnections.length,
      freeConnections: writePool.pool._freeConnections.length,
      queuedRequests: writePool.pool._connectionQueue.length,
    },
    read: {
      totalConnections: readPool.pool._allConnections.length,
      activeConnections: readPool.pool._allConnections.length - readPool.pool._freeConnections.length,
      freeConnections: readPool.pool._freeConnections.length,
      queuedRequests: readPool.pool._connectionQueue.length,
    },
  };
}

/**
 * Verificar conexión a la base de datos
 */
async function testConnection() {
  try {
    const [writeResult] = await writePool.query('SELECT 1 as test');
    const [readResult] = await readPool.query('SELECT 1 as test');

    if (writeResult[0].test === 1 && readResult[0].test === 1) {
      console.log('✅ Database connection successful (WRITE & READ pools)');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Cerrar todos los pools
 */
async function closePools() {
  try {
    await writePool.end();
    await readPool.end();
    console.log('✅ Database pools closed successfully');
  } catch (error) {
    console.error('❌ Error closing database pools:', error);
    throw error;
  }
}

/**
 * Ejecutar query con retry automático
 */
async function queryWithRetry(pool, sql, params, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      lastError = error;

      // Si es un error de conexión, reintentar
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
        console.warn(`⚠️ Connection lost, retrying... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Si es otro tipo de error, lanzarlo inmediatamente
      throw error;
    }
  }

  throw lastError;
}

// ==================== EXPORTAR ====================
module.exports = {
  writePool,
  readPool,
  getPoolStats,
  testConnection,
  closePools,
  queryWithRetry,
};
