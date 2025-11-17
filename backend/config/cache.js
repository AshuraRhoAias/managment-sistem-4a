const NodeCache = require('node-cache');
const { CACHE_TTL } = require('./constants');

/**
 * SISTEMA DE CACHÉ MULTI-TIER
 * Diferentes cachés para diferentes tipos de datos
 */

// ==================== CACHÉ PRINCIPAL ====================
// Para datos generales del sistema
const mainCache = new NodeCache({
  stdTTL: CACHE_TTL.MEDIUM,
  checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 60,
  useClones: true,
  deleteOnExpire: true,
  maxKeys: 10000,
});

// ==================== CACHÉ DE ESTADÍSTICAS ====================
// Para dashboards y reportes
const statsCache = new NodeCache({
  stdTTL: CACHE_TTL.STATS,
  checkperiod: 120,
  useClones: true,
  deleteOnExpire: true,
  maxKeys: 1000,
});

// ==================== CACHÉ DE SESIONES ====================
// Para tokens JWT y sesiones de usuario
const sessionCache = new NodeCache({
  stdTTL: CACHE_TTL.SESSION,
  checkperiod: 60,
  useClones: false, // No clonar para mejor rendimiento
  deleteOnExpire: true,
  maxKeys: 5000,
});

// ==================== CACHÉ DE BÚSQUEDAS ====================
// Para resultados de búsqueda (TTL corto)
const searchCache = new NodeCache({
  stdTTL: CACHE_TTL.SHORT,
  checkperiod: 30,
  useClones: true,
  deleteOnExpire: true,
  maxKeys: 2000,
});

// ==================== CACHÉ DE BLOQUEOS IP ====================
// Para IPs bloqueadas y rate limiting
const securityCache = new NodeCache({
  stdTTL: 3600, // 1 hora
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 10000,
});

// ==================== EVENTOS DE CACHÉ ====================

mainCache.on('expired', (key, value) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`🗑️ Cache expired: ${key}`);
  }
});

mainCache.on('flush', () => {
  console.log('🗑️ Main cache flushed');
});

statsCache.on('expired', (key, value) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`📊 Stats cache expired: ${key}`);
  }
});

sessionCache.on('expired', (key, value) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`🔐 Session expired: ${key}`);
  }
});

searchCache.on('expired', (key, value) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`🔍 Search cache expired: ${key}`);
  }
});

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtener estadísticas de todos los cachés
 */
function getAllCacheStats() {
  return {
    main: {
      keys: mainCache.keys().length,
      hits: mainCache.getStats().hits,
      misses: mainCache.getStats().misses,
      ksize: mainCache.getStats().ksize,
      vsize: mainCache.getStats().vsize,
    },
    stats: {
      keys: statsCache.keys().length,
      hits: statsCache.getStats().hits,
      misses: statsCache.getStats().misses,
      ksize: statsCache.getStats().ksize,
      vsize: statsCache.getStats().vsize,
    },
    session: {
      keys: sessionCache.keys().length,
      hits: sessionCache.getStats().hits,
      misses: sessionCache.getStats().misses,
      ksize: sessionCache.getStats().ksize,
      vsize: sessionCache.getStats().vsize,
    },
    search: {
      keys: searchCache.keys().length,
      hits: searchCache.getStats().hits,
      misses: searchCache.getStats().misses,
      ksize: searchCache.getStats().ksize,
      vsize: searchCache.getStats().vsize,
    },
    security: {
      keys: securityCache.keys().length,
      hits: securityCache.getStats().hits,
      misses: securityCache.getStats().misses,
      ksize: securityCache.getStats().ksize,
      vsize: securityCache.getStats().vsize,
    },
  };
}

/**
 * Limpiar todos los cachés
 */
function flushAllCaches() {
  mainCache.flushAll();
  statsCache.flushAll();
  sessionCache.flushAll();
  searchCache.flushAll();
  // No limpiar securityCache para mantener bloqueos activos
  console.log('✅ All caches flushed (except security)');
}

/**
 * Limpiar cachés por patrón
 */
function deleteByPattern(cache, pattern) {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  const keysToDelete = keys.filter(key => regex.test(key));

  keysToDelete.forEach(key => cache.del(key));

  return keysToDelete.length;
}

/**
 * Invalidar caché relacionado con una entidad
 */
function invalidateEntityCache(entityType, entityId = null) {
  const patterns = {
    state: ['states', 'delegations', 'colonies', 'families', 'persons', 'stats'],
    delegation: ['delegations', 'colonies', 'families', 'persons', 'stats'],
    colony: ['colonies', 'families', 'persons', 'stats'],
    family: ['families', 'persons', 'stats'],
    person: ['persons', 'stats'],
    user: ['users', 'stats'],
  };

  const patternsToInvalidate = patterns[entityType] || [];

  patternsToInvalidate.forEach(pattern => {
    deleteByPattern(mainCache, pattern);
    deleteByPattern(statsCache, pattern);
    deleteByPattern(searchCache, pattern);
  });

  console.log(`♻️ Cache invalidated for entity: ${entityType}`);
}

/**
 * Wrapper para get con fallback
 */
async function getOrSet(cache, key, fetchFunction, ttl = null) {
  // Intentar obtener del caché
  const cached = cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  // Si no está en caché, ejecutar función
  const value = await fetchFunction();

  // Guardar en caché
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }

  return value;
}

/**
 * Cerrar todos los cachés
 */
function closeAllCaches() {
  mainCache.close();
  statsCache.close();
  sessionCache.close();
  searchCache.close();
  securityCache.close();
  console.log('✅ All caches closed');
}

// ==================== EXPORTAR ====================
module.exports = {
  mainCache,
  statsCache,
  sessionCache,
  searchCache,
  securityCache,
  getAllCacheStats,
  flushAllCaches,
  deleteByPattern,
  invalidateEntityCache,
  getOrSet,
  closeAllCaches,
};
