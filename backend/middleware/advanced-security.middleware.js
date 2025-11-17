const { securityCache } = require('../config/cache');
const { writePool, readPool } = require('../config/database');
const axios = require('axios');

/**
 * ============================================
 * MIDDLEWARE DE SEGURIDAD AVANZADO
 * - Bloqueo por intentos: 10/día, 50/semana, 80/mes
 * - Geolocalización precisa de IP
 * - Detección de ubicación del navegador
 * ============================================
 */

class AdvancedSecurityMiddleware {
  constructor() {
    this.cache = securityCache;

    // Tiempos en milisegundos
    this.TIME_1_HOUR = 60 * 60 * 1000;
    this.TIME_2_WEEKS = 14 * 24 * 60 * 60 * 1000;
    this.TIME_5_MONTHS = 5 * 30 * 24 * 60 * 60 * 1000;

    // Limpiar IPs bloqueadas expiradas cada hora
    setInterval(() => this.cleanupExpiredBlocks(), this.TIME_1_HOUR);
  }

  /**
   * Obtener IP real del cliente
   */
  getClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * Obtener geolocalización de IP usando ipapi.co
   */
  async getIPGeolocation(ip) {
    try {
      // No geolocalizar IPs locales
      if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return {
          latitude: null,
          longitude: null,
          country: 'Local',
          city: 'Local',
          isp: 'Local Network'
        };
      }

      // Intentar desde caché
      const cacheKey = `geo:${ip}`;
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;

      // Obtener datos de geolocalización
      const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 5000
      });

      const data = response.data;
      const geoData = {
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country_name || 'Unknown',
        city: data.city || 'Unknown',
        isp: data.org || 'Unknown'
      };

      // Guardar en caché por 24 horas
      this.cache.set(cacheKey, geoData, 86400);

      return geoData;
    } catch (error) {
      console.error('Error getting IP geolocation:', error.message);
      return {
        latitude: null,
        longitude: null,
        country: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown'
      };
    }
  }

  /**
   * Verificar ubicación del navegador
   */
  checkBrowserLocation = async (req, res, next) => {
    try {
      const browserLat = req.headers['x-browser-latitude'];
      const browserLon = req.headers['x-browser-longitude'];
      const accuracy = req.headers['x-location-accuracy'];

      // Si no hay ubicación del navegador, registrar y continuar
      if (!browserLat || !browserLon) {
        console.warn(`⚠️ Ubicación del navegador no proporcionada desde IP: ${this.getClientIP(req)}`);

        // Registrar en auditoría
        await this.logSecurityEvent(req, 'UBICACION_RECHAZADA', {
          reason: 'No se proporcionó ubicación del navegador'
        });
      }

      // Guardar ubicación en request para uso posterior
      req.browserLocation = {
        latitude: browserLat ? parseFloat(browserLat) : null,
        longitude: browserLon ? parseFloat(browserLon) : null,
        accuracy: accuracy ? parseFloat(accuracy) : null
      };

      next();
    } catch (error) {
      console.error('Error checking browser location:', error);
      next();
    }
  };

  /**
   * Verificar si IP está bloqueada
   */
  checkIPBlocked = async (req, res, next) => {
    try {
      const clientIP = this.getClientIP(req);

      // Verificar en base de datos
      const [blocked] = await readPool.query(
        `SELECT id, bloqueado_hasta, bloqueado_permanente, razon, intentos_dia, intentos_semana, intentos_mes
         FROM ips_bloqueadas
         WHERE ip_address = ?`,
        [clientIP]
      );

      if (blocked.length > 0) {
        const ipData = blocked[0];

        // Verificar bloqueo permanente
        if (ipData.bloqueado_permanente) {
          console.error(`🚫 IP BLOQUEADA PERMANENTEMENTE: ${clientIP}`);

          await this.logSecurityEvent(req, 'IP_BLOQUEADA', {
            reason: 'Bloqueo permanente',
            intentos: {
              dia: ipData.intentos_dia,
              semana: ipData.intentos_semana,
              mes: ipData.intentos_mes
            }
          });

          return res.status(403).json({
            success: false,
            error: 'IP_BLOCKED_PERMANENT',
            message: 'Su dirección IP ha sido bloqueada permanentemente por actividad sospechosa.',
          });
        }

        // Verificar bloqueo temporal
        if (ipData.bloqueado_hasta && new Date(ipData.bloqueado_hasta) > new Date()) {
          const remainingMinutes = Math.ceil((new Date(ipData.bloqueado_hasta) - new Date()) / 1000 / 60);

          console.warn(`⚠️ IP bloqueada temporalmente: ${clientIP} (${remainingMinutes} min restantes)`);

          return res.status(403).json({
            success: false,
            error: 'IP_BLOCKED_TEMPORARY',
            message: `Su IP ha sido bloqueada temporalmente. Intente nuevamente en ${remainingMinutes} minutos.`,
            remainingMinutes,
            reason: ipData.razon
          });
        }
      }

      next();
    } catch (error) {
      console.error('Error checking IP block:', error);
      next();
    }
  };

  /**
   * Registrar intento fallido de login
   */
  async recordFailedLogin(req, userId = null) {
    try {
      const clientIP = this.getClientIP(req);
      const now = new Date();

      // Obtener geolocalización
      const geoData = await this.getIPGeolocation(clientIP);

      // Buscar o crear registro de IP
      let [ipRecords] = await readPool.query(
        'SELECT * FROM ips_bloqueadas WHERE ip_address = ?',
        [clientIP]
      );

      let ipData;

      if (ipRecords.length === 0) {
        // Crear nuevo registro
        const [result] = await writePool.query(
          `INSERT INTO ips_bloqueadas (
            ip_address, intentos_dia, intentos_semana, intentos_mes,
            latitude, longitude, country, city, isp
          ) VALUES (?, 1, 1, 1, ?, ?, ?, ?, ?)`,
          [
            clientIP, geoData.latitude, geoData.longitude,
            geoData.country, geoData.city, geoData.isp
          ]
        );

        ipData = {
          id: result.insertId,
          intentos_dia: 1,
          intentos_semana: 1,
          intentos_mes: 1
        };
      } else {
        ipData = ipRecords[0];

        // Resetear contadores si pasó el tiempo
        const primerIntento = new Date(ipData.primer_intento);
        const ultimoIntento = new Date(ipData.ultimo_intento);

        const diffDias = Math.floor((now - primerIntento) / (1000 * 60 * 60 * 24));
        const diffSemanas = Math.floor(diffDias / 7);
        const diffMeses = Math.floor(diffDias / 30);

        let resetDia = diffDias >= 1;
        let resetSemana = diffSemanas >= 1;
        let resetMes = diffMeses >= 1;

        // Incrementar contadores
        const nuevoIntentosDia = resetDia ? 1 : ipData.intentos_dia + 1;
        const nuevoIntentosSemana = resetSemana ? 1 : ipData.intentos_semana + 1;
        const nuevoIntentosMes = resetMes ? 1 : ipData.intentos_mes + 1;

        // Determinar tipo de bloqueo
        let bloqueadoHasta = null;
        let bloqueadoPermanente = false;
        let razon = '';

        // 10 intentos en 1 día = 1 hora de bloqueo
        if (nuevoIntentosDia >= 10) {
          bloqueadoHasta = new Date(now.getTime() + this.TIME_1_HOUR);
          razon = '10 intentos fallidos en 1 día';
          console.warn(`🔒 IP ${clientIP} bloqueada por 1 hora: ${razon}`);
        }

        // 50 intentos en 1 semana = 2 semanas de bloqueo
        if (nuevoIntentosSemana >= 50) {
          bloqueadoHasta = new Date(now.getTime() + this.TIME_2_WEEKS);
          razon = '50 intentos fallidos en 1 semana';
          console.warn(`🔒 IP ${clientIP} bloqueada por 2 semanas: ${razon}`);
        }

        // 80 intentos en 1 mes = 5 meses de bloqueo (casi permanente)
        if (nuevoIntentosMes >= 80) {
          bloqueadoHasta = new Date(now.getTime() + this.TIME_5_MONTHS);
          bloqueadoPermanente = true;
          razon = '80+ intentos fallidos en 1 mes - BLOQUEADO PERMANENTE';
          console.error(`🚫 IP ${clientIP} BLOQUEADA PERMANENTEMENTE: ${razon}`);
        }

        // Actualizar registro
        await writePool.query(
          `UPDATE ips_bloqueadas SET
            intentos_dia = ?,
            intentos_semana = ?,
            intentos_mes = ?,
            bloqueado_hasta = ?,
            bloqueado_permanente = ?,
            razon = ?,
            latitude = ?,
            longitude = ?,
            country = ?,
            city = ?,
            isp = ?,
            ultimo_intento = NOW()
          WHERE id = ?`,
          [
            nuevoIntentosDia, nuevoIntentosSemana, nuevoIntentosMes,
            bloqueadoHasta, bloqueadoPermanente, razon,
            geoData.latitude, geoData.longitude, geoData.country,
            geoData.city, geoData.isp, ipData.id
          ]
        );

        ipData.intentos_dia = nuevoIntentosDia;
        ipData.intentos_semana = nuevoIntentosSemana;
        ipData.intentos_mes = nuevoIntentosMes;
      }

      // Actualizar contador del usuario si existe
      if (userId) {
        await this.updateUserFailedAttempts(userId);
      }

      console.warn(`⚠️ Intento fallido registrado para IP ${clientIP}:`, {
        dia: ipData.intentos_dia,
        semana: ipData.intentos_semana,
        mes: ipData.intentos_mes,
        location: `${geoData.city}, ${geoData.country}`,
        coords: `${geoData.latitude}, ${geoData.longitude}`
      });

      return ipData;
    } catch (error) {
      console.error('Error recording failed login:', error);
      throw error;
    }
  }

  /**
   * Actualizar intentos fallidos del usuario
   */
  async updateUserFailedAttempts(userId) {
    try {
      const now = new Date();

      // Obtener datos actuales
      const [users] = await readPool.query(
        'SELECT intentos_fallidos_dia, intentos_fallidos_semana, intentos_fallidos_mes, ultimo_intento_fallido FROM usuarios WHERE id = ?',
        [userId]
      );

      if (users.length === 0) return;

      const user = users[0];
      const ultimoIntento = user.ultimo_intento_fallido ? new Date(user.ultimo_intento_fallido) : new Date(0);

      const diffDias = Math.floor((now - ultimoIntento) / (1000 * 60 * 60 * 24));

      // Resetear contadores según tiempo transcurrido
      const nuevoIntentosDia = diffDias >= 1 ? 1 : user.intentos_fallidos_dia + 1;
      const nuevoIntentosSemana = diffDias >= 7 ? 1 : user.intentos_fallidos_semana + 1;
      const nuevoIntentosMes = diffDias >= 30 ? 1 : user.intentos_fallidos_mes + 1;

      // Determinar bloqueo del usuario
      let bloqueadoHasta = null;

      if (nuevoIntentosDia >= 10) {
        bloqueadoHasta = new Date(now.getTime() + this.TIME_1_HOUR);
      }

      if (nuevoIntentosSemana >= 50) {
        bloqueadoHasta = new Date(now.getTime() + this.TIME_2_WEEKS);
      }

      if (nuevoIntentosMes >= 80) {
        // Bloquear cuenta permanentemente
        await writePool.query(
          'UPDATE usuarios SET bloqueado_permanente = 1, activo = 0 WHERE id = ?',
          [userId]
        );
        console.error(`🚫 USUARIO ${userId} BLOQUEADO PERMANENTEMENTE`);
      }

      // Actualizar contadores
      await writePool.query(
        `UPDATE usuarios SET
          intentos_fallidos_dia = ?,
          intentos_fallidos_semana = ?,
          intentos_fallidos_mes = ?,
          bloqueado_hasta = ?,
          ultimo_intento_fallido = NOW()
        WHERE id = ?`,
        [nuevoIntentosDia, nuevoIntentosSemana, nuevoIntentosMes, bloqueadoHasta, userId]
      );

    } catch (error) {
      console.error('Error updating user failed attempts:', error);
    }
  }

  /**
   * Limpiar intentos después de login exitoso
   */
  async clearLoginAttempts(req, userId) {
    try {
      const clientIP = this.getClientIP(req);

      // Limpiar contadores de IP (pero mantener registro)
      await writePool.query(
        `UPDATE ips_bloqueadas SET
          intentos_dia = 0,
          bloqueado_hasta = NULL,
          razon = NULL
        WHERE ip_address = ? AND bloqueado_permanente = 0`,
        [clientIP]
      );

      // Limpiar contadores de usuario
      await writePool.query(
        `UPDATE usuarios SET
          intentos_fallidos_dia = 0,
          intentos_fallidos_semana = 0,
          intentos_fallidos_mes = 0,
          bloqueado_hasta = NULL,
          ultimo_intento_fallido = NULL
        WHERE id = ?`,
        [userId]
      );

      console.log(`✅ Intentos fallidos limpiados para IP ${clientIP} y usuario ${userId}`);
    } catch (error) {
      console.error('Error clearing login attempts:', error);
    }
  }

  /**
   * Limpiar bloqueos expirados
   */
  async cleanupExpiredBlocks() {
    try {
      const [result] = await writePool.query(
        `UPDATE ips_bloqueadas SET
          bloqueado_hasta = NULL,
          razon = NULL
        WHERE bloqueado_hasta < NOW() AND bloqueado_permanente = 0`
      );

      if (result.affectedRows > 0) {
        console.log(`🧹 Limpiados ${result.affectedRows} bloqueos de IP expirados`);
      }
    } catch (error) {
      console.error('Error cleaning up expired blocks:', error);
    }
  }

  /**
   * Registrar evento de seguridad
   */
  async logSecurityEvent(req, action, details = {}) {
    try {
      const clientIP = this.getClientIP(req);
      const geoData = await this.getIPGeolocation(clientIP);

      await writePool.query(
        `INSERT INTO auditoria_accesos (
          id_usuario, accion, ip_address, user_agent,
          ip_latitude, ip_longitude, ip_country, ip_city,
          browser_latitude, browser_longitude, location_accuracy,
          detalles, created_at
        ) VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          action,
          clientIP,
          req.headers['user-agent'] || 'unknown',
          geoData.latitude,
          geoData.longitude,
          geoData.country,
          geoData.city,
          req.browserLocation?.latitude || null,
          req.browserLocation?.longitude || null,
          req.browserLocation?.accuracy || null,
          JSON.stringify(details)
        ]
      );
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Obtener estadísticas de seguridad
   */
  async getSecurityStats() {
    try {
      const [blockedIPs] = await readPool.query(
        'SELECT COUNT(*) as total FROM ips_bloqueadas WHERE bloqueado_hasta > NOW() OR bloqueado_permanente = 1'
      );

      const [failedAttempts] = await readPool.query(
        'SELECT SUM(intentos_dia) as dia, SUM(intentos_semana) as semana, SUM(intentos_mes) as mes FROM ips_bloqueadas'
      );

      const [topBlockedIPs] = await readPool.query(
        `SELECT ip_address, intentos_mes, country, city, latitude, longitude, razon
         FROM ips_bloqueadas
         ORDER BY intentos_mes DESC
         LIMIT 10`
      );

      return {
        totalBlockedIPs: blockedIPs[0].total,
        failedAttempts: {
          today: failedAttempts[0].dia || 0,
          thisWeek: failedAttempts[0].semana || 0,
          thisMonth: failedAttempts[0].mes || 0
        },
        topBlockedIPs
      };
    } catch (error) {
      console.error('Error getting security stats:', error);
      return null;
    }
  }
}

// Singleton
const advancedSecurityMiddleware = new AdvancedSecurityMiddleware();

module.exports = advancedSecurityMiddleware;
