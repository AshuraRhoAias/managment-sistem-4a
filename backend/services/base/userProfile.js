const { sessionCache } = require('../../config/cache');
const cryptoService = require('./CryptoService');

/**
 * ============================================
 * PERFIL PÚBLICO DE USUARIO
 * La tabla `usuarios` guarda nombre, email y rol cifrados
 * (nombre_encrypted/_iv/_tag…). Este helper los descifra y
 * devuelve { id, nombre, email, rol }. También entiende el
 * esquema antiguo con columnas en texto plano.
 * ============================================
 */

const decryptField = (row, field) =>
  cryptoService.decrypt({
    encrypted: row[`${field}_encrypted`],
    iv: row[`${field}_iv`],
    authTag: row[`${field}_tag`],
  });

async function toPublicUser(row) {
  if (!row) return null;

  const base = { id: row.id, created_at: row.created_at, last_login: row.last_login };

  // Esquema antiguo (texto plano)
  if (row.nombre_encrypted === undefined) {
    return { ...base, nombre: row.nombre, email: row.email, rol: row.rol };
  }

  // Los tags cambian con cada cifrado, así que la clave se invalida sola si el usuario cambia.
  const cacheKey = `profile:${row.id}:${row.nombre_tag}:${row.email_tag}:${row.rol_tag}`;
  let profile = sessionCache.get(cacheKey);

  if (!profile) {
    const [nombre, email, rol] = await Promise.all([
      decryptField(row, 'nombre'),
      decryptField(row, 'email'),
      decryptField(row, 'rol'),
    ]);
    profile = { nombre, email, rol };
    sessionCache.set(cacheKey, profile, 300);
  }

  return { ...base, ...profile };
}

module.exports = { toPublicUser };
