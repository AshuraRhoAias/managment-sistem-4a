const { securityCache } = require('../config/cache');
const { SECURITY, ERRORS, HTTP_STATUS } = require('../config/constants');
const { writePool } = require('../config/database');

/**
 * ============================================
 * MIDDLEWARE DE SEGURIDAD ANTI-HACKERS
 * ============================================
 *
 * Protección contra:
 * - Intentos de login fallidos
 * - Ataques de fuerza bruta
 * - Escaneo de puertos
 * - Inyección SQL
 * - XSS
 * - DDoS
 * - Actividad sospechosa
 */

class SecurityMiddleware {
  constructor() {
    this.cache = securityCache;
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Map();
    this.loginAttempts = new Map();

    // Cargar IPs bloqueadas permanentemente desde ENV
    this.loadBlacklistedIPs();

    // Limpiar cache cada hora
    setInterval(() => this.cleanupCache(), 3600000);
  }

  /**
   * Cargar IPs de lista negra desde variables de entorno
   */
  loadBlacklistedIPs() {
    const blacklist = process.env.BLACKLIST_IPS || '';
    if (blacklist) {
      blacklist.split(',').forEach(ip => {
        const trimmed = ip.trim();
        if (trimmed) {
          this.blockedIPs.add(trimmed);
          console.log(`🚫 IP bloqueada permanentemente: ${trimmed}`);
        }
      });
    }
  }

  /**
   * Obtener IP real del cliente (considera proxies)
   */
  getClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * ============================================
   * VERIFICACIÓN DE IP BLOQUEADA
   * ============================================
   */
  checkIPBlocked = (req, res, next) => {
    const clientIP = this.getClientIP(req);

    // Verificar lista negra permanente
    if (this.blockedIPs.has(clientIP)) {
      console.warn(`🚫 IP bloqueada permanentemente intentó acceder: ${clientIP}`);
      this.logSecurityEvent(clientIP, 'BLOCKED_IP_ATTEMPT', req);

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.IP_BLOCKED,
        message: 'Su IP ha sido bloqueada permanentemente.',
      });
    }

    // Verificar bloqueo temporal
    const blockKey = `blocked:${clientIP}`;
    const blockedUntil = this.cache.get(blockKey);

    if (blockedUntil) {
      const remainingTime = Math.ceil((blockedUntil - Date.now()) / 1000 / 60);

      console.warn(`🚫 IP bloqueada temporalmente intentó acceder: ${clientIP} (${remainingTime} min restantes)`);

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.IP_BLOCKED,
        message: `Su IP ha sido bloqueada temporalmente. Intente nuevamente en ${remainingTime} minutos.`,
        remainingMinutes: remainingTime,
      });
    }

    next();
  };

  /**
   * ============================================
   * BLOQUEO DE IP (TEMPORAL)
   * ============================================
   */
  blockIP(ip, durationMinutes = SECURITY.IP_BLOCK_DURATION_MINUTES) {
    const blockUntil = Date.now() + durationMinutes * 60 * 1000;
    const blockKey = `blocked:${ip}`;

    this.cache.set(blockKey, blockUntil, durationMinutes * 60);

    console.warn(`🚫 IP bloqueada: ${ip} por ${durationMinutes} minutos`);

    // Registrar en base de datos
    this.logBlockedIP(ip, durationMinutes);
  }

  /**
   * Bloqueo permanente de IP
   */
  permanentBlockIP(ip) {
    this.blockedIPs.add(ip);
    console.warn(`🚫 IP bloqueada PERMANENTEMENTE: ${ip}`);

    // Registrar en base de datos
    this.logBlockedIP(ip, 'PERMANENT');
  }

  /**
   * ============================================
   * DETECCIÓN DE INTENTOS DE LOGIN FALLIDOS
   * ============================================
   */
  trackLoginAttempt = async (req, res, next) => {
    const clientIP = this.getClientIP(req);
    const attemptKey = `login_attempts:${clientIP}`;

    // Obtener intentos actuales
    let attempts = this.cache.get(attemptKey) || 0;

    // Si ya superó el máximo, bloquear
    if (attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
      this.blockIP(clientIP, SECURITY.LOCKOUT_DURATION_MINUTES);

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.ACCOUNT_LOCKED,
        message: `Demasiados intentos fallidos. IP bloqueada por ${SECURITY.LOCKOUT_DURATION_MINUTES} minutos.`,
      });
    }

    // Guardar IP en request para uso posterior
    req.clientIP = clientIP;
    req.attemptKey = attemptKey;

    next();
  };

  /**
   * Registrar intento fallido
   */
  recordFailedLogin(req) {
    const clientIP = req.clientIP || this.getClientIP(req);
    const attemptKey = `login_attempts:${clientIP}`;

    let attempts = this.cache.get(attemptKey) || 0;
    attempts++;

    // Guardar por 15 minutos
    this.cache.set(attemptKey, attempts, 900);

    console.warn(`⚠️ Intento de login fallido #${attempts} desde IP: ${clientIP}`);

    // Si alcanzó el máximo, bloquear
    if (attempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
      this.blockIP(clientIP, SECURITY.LOCKOUT_DURATION_MINUTES);
    }

    return attempts;
  }

  /**
   * Limpiar intentos después de login exitoso
   */
  clearLoginAttempts(req) {
    const clientIP = req.clientIP || this.getClientIP(req);
    const attemptKey = `login_attempts:${clientIP}`;

    this.cache.del(attemptKey);
  }

  /**
   * ============================================
   * DETECCIÓN DE ACTIVIDAD SOSPECHOSA
   * ============================================
   */
  detectSuspiciousActivity = (req, res, next) => {
    const clientIP = this.getClientIP(req);
    const suspiciousKey = `suspicious:${clientIP}`;

    let score = this.cache.get(suspiciousKey) || 0;

    // Patrones sospechosos
    const suspiciousPatterns = [
      // SQL Injection
      /(\bSELECT\b|\bUNION\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
      // XSS
      /<script|javascript:|onerror=|onload=/i,
      // Path Traversal
      /\.\.[\/\\]/,
      // Command Injection
      /[;&|`$]/,
    ];

    const requestString = JSON.stringify({
      url: req.url,
      query: req.query,
      body: req.body,
    });

    // Verificar patrones sospechosos
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(requestString)) {
        score += 10;
        console.warn(`⚠️ Patrón sospechoso detectado desde IP ${clientIP}: ${pattern}`);
      }
    });

    // Verificar User-Agent sospechoso
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'metasploit'];

    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      score += 20;
      console.warn(`⚠️ User-Agent sospechoso desde IP ${clientIP}: ${userAgent}`);
    }

    // Verificar exceso de peticiones en corto tiempo
    const requestsKey = `requests:${clientIP}`;
    let requests = this.cache.get(requestsKey) || 0;
    requests++;
    this.cache.set(requestsKey, requests, 60); // 1 minuto

    if (requests > 200) {
      score += 15;
      console.warn(`⚠️ Exceso de peticiones desde IP ${clientIP}: ${requests} req/min`);
    }

    // Actualizar score
    if (score > 0) {
      this.cache.set(suspiciousKey, score, 600); // 10 minutos
    }

    // Si el score es muy alto, bloquear
    if (score >= 30) {
      console.error(`🚨 ACTIVIDAD ALTAMENTE SOSPECHOSA desde IP ${clientIP} (score: ${score})`);
      this.blockIP(clientIP, 120); // Bloquear por 2 horas
      this.logSecurityEvent(clientIP, 'SUSPICIOUS_ACTIVITY', req, { score });

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.IP_BLOCKED,
        message: 'Actividad sospechosa detectada. IP bloqueada.',
      });
    }

    next();
  };

  /**
   * ============================================
   * VALIDACIÓN DE HEADERS
   * ============================================
   */
  validateHeaders = (req, res, next) => {
    const clientIP = this.getClientIP(req);

    // Verificar Content-Type en peticiones POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`⚠️ Content-Type inválido desde IP ${clientIP}: ${contentType}`);

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERRORS.BAD_REQUEST,
          message: 'Content-Type debe ser application/json',
        });
      }
    }

    // Verificar User-Agent
    const userAgent = req.headers['user-agent'];
    if (!userAgent || userAgent.length < 10) {
      console.warn(`⚠️ User-Agent sospechoso/ausente desde IP ${clientIP}`);
    }

    next();
  };

  /**
   * ============================================
   * LOGGING DE EVENTOS DE SEGURIDAD
   * ============================================
   */
  async logSecurityEvent(ip, eventType, req, extraData = {}) {
    try {
      const sql = `
        INSERT INTO auditoria_accesos (id_usuario, accion, ip_address, user_agent, detalles, created_at)
        VALUES (0, ?, ?, ?, ?, NOW())
      `;

      const details = {
        eventType,
        url: req.url,
        method: req.method,
        headers: req.headers,
        ...extraData,
      };

      await writePool.query(sql, [
        eventType,
        ip,
        req.headers['user-agent'] || 'unknown',
        JSON.stringify(details),
      ]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Registrar IP bloqueada en base de datos
   */
  async logBlockedIP(ip, duration) {
    try {
      const sql = `
        INSERT INTO auditoria_accesos (id_usuario, accion, ip_address, detalles, created_at)
        VALUES (0, 'IP_BLOCKED', ?, ?, NOW())
      `;

      await writePool.query(sql, [
        ip,
        JSON.stringify({ duration, timestamp: new Date() }),
      ]);
    } catch (error) {
      console.error('Error logging blocked IP:', error);
    }
  }

  /**
   * ============================================
   * UTILIDADES
   * ============================================
   */
  cleanupCache() {
    const keys = this.cache.keys();
    console.log(`🧹 Limpieza de caché de seguridad: ${keys.length} entradas`);

    // Limpiar entradas expiradas
    keys.forEach(key => {
      const value = this.cache.get(key);
      if (value && typeof value === 'number' && value < Date.now()) {
        this.cache.del(key);
      }
    });
  }

  /**
   * Obtener estadísticas de seguridad
   */
  getStats() {
    const keys = this.cache.keys();

    const blocked = keys.filter(k => k.startsWith('blocked:')).length;
    const suspicious = keys.filter(k => k.startsWith('suspicious:')).length;
    const loginAttempts = keys.filter(k => k.startsWith('login_attempts:')).length;

    return {
      permanentlyBlocked: this.blockedIPs.size,
      temporarilyBlocked: blocked,
      suspiciousIPs: suspicious,
      activeLoginAttempts: loginAttempts,
      totalCacheEntries: keys.length,
    };
  }

  /**
   * Desbloquear IP manualmente
   */
  unblockIP(ip) {
    const blockKey = `blocked:${ip}`;
    this.cache.del(blockKey);
    this.blockedIPs.delete(ip);

    console.log(`✅ IP desbloqueada: ${ip}`);
  }
}

// Singleton
const securityMiddleware = new SecurityMiddleware();

module.exports = securityMiddleware;
