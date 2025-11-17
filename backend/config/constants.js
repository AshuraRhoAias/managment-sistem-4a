/**
 * CONSTANTES DEL SISTEMA ELECTORAL
 * Configuración centralizada de valores constantes
 */

module.exports = {
  // ==================== ROLES Y PERMISOS ====================
  ROLES: {
    ADMIN: 'ADMIN',
    COORDINADOR: 'COORDINADOR',
    CAPTURISTA: 'CAPTURISTA',
  },

  PERMISSIONS: {
    ADMIN: ['read', 'create', 'update', 'delete', 'export', 'manage_users'],
    COORDINADOR: ['read', 'create', 'update', 'export'],
    CAPTURISTA: ['read', 'create'],
  },

  // ==================== ESTADOS DE ENTIDADES ====================
  FAMILY_STATUS: {
    ACTIVE: 'ACTIVA',
    INACTIVE: 'INACTIVA',
  },

  GENDER: {
    MALE: 'MASCULINO',
    FEMALE: 'FEMENINO',
    OTHER: 'OTRO',
  },

  FAMILY_ROLE: {
    HEAD: 'JEFE DE FAMILIA',
    MEMBER: 'MIEMBRO',
  },

  // ==================== ACCIONES DE AUDITORÍA ====================
  AUDIT_ACTIONS: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FALLIDO',
    CREATE: 'CREAR',
    UPDATE: 'EDITAR',
    DELETE: 'ELIMINAR',
    READ: 'CONSULTAR',
    EXPORT: 'EXPORTAR',
  },

  // ==================== SEGURIDAD ====================
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCKOUT_DURATION_MINUTES: parseInt(process.env.LOCKOUT_DURATION) || 30,
    IP_BLOCK_DURATION_MINUTES: parseInt(process.env.IP_BLOCK_DURATION) || 60,
    BCRYPT_SALT_ROUNDS: 12,
    PASSWORD_MIN_LENGTH: 8,
    TOKEN_HEADER: 'authorization',
    TOKEN_PREFIX: 'Bearer ',
  },

  // ==================== RATE LIMITING ====================
  RATE_LIMITS: {
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // 5 intentos
      message: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.',
    },
    API_READ: {
      windowMs: 60 * 1000, // 1 minuto
      max: 100, // 100 peticiones
      message: 'Demasiadas peticiones. Intente nuevamente en un minuto.',
    },
    API_WRITE: {
      windowMs: 60 * 1000, // 1 minuto
      max: 30, // 30 peticiones
      message: 'Demasiadas peticiones de escritura. Intente nuevamente en un minuto.',
    },
    SEARCH: {
      windowMs: 60 * 1000, // 1 minuto
      max: 50, // 50 búsquedas
      message: 'Demasiadas búsquedas. Intente nuevamente en un minuto.',
    },
    EXPORT: {
      windowMs: 5 * 60 * 1000, // 5 minutos
      max: 10, // 10 exportaciones
      message: 'Demasiadas exportaciones. Intente nuevamente en 5 minutos.',
    },
  },

  // ==================== CACHÉ TTL ====================
  CACHE_TTL: {
    SHORT: parseInt(process.env.CACHE_TTL_SHORT) || 120, // 2 minutos
    MEDIUM: parseInt(process.env.CACHE_TTL_MEDIUM) || 300, // 5 minutos
    LONG: parseInt(process.env.CACHE_TTL_LONG) || 600, // 10 minutos
    STATS: parseInt(process.env.CACHE_TTL_STATS) || 600, // 10 minutos
    SESSION: 1800, // 30 minutos
  },

  // ==================== PAGINACIÓN ====================
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 1000,
  },

  // ==================== EXPORTACIÓN ====================
  EXPORT: {
    MAX_RECORDS: parseInt(process.env.EXPORT_MAX_RECORDS) || 100000,
    FORMATS: {
      CSV: 'csv',
      EXCEL: 'xlsx',
      JSON: 'json',
      PDF: 'pdf',
    },
    BATCH_SIZE: 1000,
  },

  // ==================== CIFRADO ====================
  ENCRYPTION: {
    ALGORITHM_LAYER1: 'aes-256-gcm',
    ALGORITHM_LAYER2: 'aes-256-cbc',
    ALGORITHM_LAYER3: 'chacha20',
    ALGORITHM_LAYER4: 'camellia-256-cbc',
    IV_LENGTH: 16,
    AUTH_TAG_LENGTH: 16,
    KEY_LENGTH: 32,
  },

  // ==================== VALIDACIONES ====================
  VALIDATION: {
    CURP_LENGTH: 18,
    CURP_REGEX: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
    PHONE_REGEX: /^[0-9]{10}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    POSTAL_CODE_REGEX: /^\d{5}$/,
    MIN_AGE: 0,
    MAX_AGE: 120,
  },

  // ==================== MENSAJES DE ERROR ====================
  ERRORS: {
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso prohibido',
    NOT_FOUND: 'Recurso no encontrado',
    BAD_REQUEST: 'Petición inválida',
    INTERNAL_SERVER: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos',
    IP_BLOCKED: 'IP bloqueada por actividad sospechosa',
    TOKEN_EXPIRED: 'Token expirado',
    TOKEN_INVALID: 'Token inválido',
    VALIDATION_ERROR: 'Error de validación',
    DATABASE_ERROR: 'Error de base de datos',
    ENCRYPTION_ERROR: 'Error de cifrado',
    DECRYPTION_ERROR: 'Error de descifrado',
  },

  // ==================== MENSAJES DE ÉXITO ====================
  SUCCESS: {
    CREATED: 'Creado exitosamente',
    UPDATED: 'Actualizado exitosamente',
    DELETED: 'Eliminado exitosamente',
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Cierre de sesión exitoso',
    EXPORTED: 'Exportado exitosamente',
  },

  // ==================== HTTP STATUS CODES ====================
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // ==================== ESTADOS DE MÉXICO ====================
  MEXICAN_STATES: [
    { code: 'AGS', name: 'Aguascalientes' },
    { code: 'BC', name: 'Baja California' },
    { code: 'BCS', name: 'Baja California Sur' },
    { code: 'CAMP', name: 'Campeche' },
    { code: 'CHIS', name: 'Chiapas' },
    { code: 'CHIH', name: 'Chihuahua' },
    { code: 'COAH', name: 'Coahuila' },
    { code: 'COL', name: 'Colima' },
    { code: 'CDMX', name: 'Ciudad de México' },
    { code: 'DGO', name: 'Durango' },
    { code: 'GTO', name: 'Guanajuato' },
    { code: 'GRO', name: 'Guerrero' },
    { code: 'HGO', name: 'Hidalgo' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'México' },
    { code: 'MICH', name: 'Michoacán' },
    { code: 'MOR', name: 'Morelos' },
    { code: 'NAY', name: 'Nayarit' },
    { code: 'NL', name: 'Nuevo León' },
    { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' },
    { code: 'QRO', name: 'Querétaro' },
    { code: 'QROO', name: 'Quintana Roo' },
    { code: 'SLP', name: 'San Luis Potosí' },
    { code: 'SIN', name: 'Sinaloa' },
    { code: 'SON', name: 'Sonora' },
    { code: 'TAB', name: 'Tabasco' },
    { code: 'TAMPS', name: 'Tamaulipas' },
    { code: 'TLAX', name: 'Tlaxcala' },
    { code: 'VER', name: 'Veracruz' },
    { code: 'YUC', name: 'Yucatán' },
    { code: 'ZAC', name: 'Zacatecas' },
  ],

  // ==================== TABLAS DE LA BD ====================
  TABLES: {
    STATES: 'estados',
    DELEGATIONS: 'delegaciones',
    COLONIES: 'colonias',
    FAMILIES: 'familias',
    PERSONS: 'personas',
    USERS: 'usuarios',
    SESSIONS: 'sesiones',
    AUDIT: 'auditoria_accesos',
  },

  // ==================== VISTAS DE LA BD ====================
  VIEWS: {
    STATE_SUMMARY: 'vista_resumen_estados',
    DELEGATION_SUMMARY: 'vista_resumen_delegaciones',
    FAMILY_COMPLETE: 'vista_familias_completa',
  },
};
