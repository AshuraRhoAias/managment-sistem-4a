/**
 * ============================================
 * SERVICIO: DASHBOARD
 * Estadísticas y actividad reciente
 * ============================================
 */

const { readPool } = require('../config/database');

class DashboardService {
  /**
   * Obtener estadísticas generales del dashboard
   */
  async getGeneralStats() {
    try {
      // Total de estados
      const [estados] = await readPool.query(
        'SELECT COUNT(*) as total FROM estados WHERE activo = 1'
      );

      // Total de delegaciones
      const [delegaciones] = await readPool.query(
        'SELECT COUNT(*) as total FROM delegaciones WHERE activo = 1'
      );

      // Total de colonias
      const [colonias] = await readPool.query(
        'SELECT COUNT(*) as total FROM colonias WHERE activo = 1'
      );

      // Total de familias
      const [familias] = await readPool.query(
        'SELECT COUNT(*) as total FROM familias WHERE activo = 1'
      );

      // Total de personas
      const [personas] = await readPool.query(
        'SELECT COUNT(*) as total FROM personas WHERE activo = 1'
      );

      // Total de votantes (mayores de 18)
      const [votantes] = await readPool.query(
        'SELECT COUNT(*) as total FROM personas WHERE puede_votar = 1 AND activo = 1'
      );

      // Nuevas familias este mes
      const [nuevasFamilias] = await readPool.query(
        `SELECT COUNT(*) as total FROM familias
         WHERE activo = 1
         AND MONTH(created_at) = MONTH(CURRENT_DATE())
         AND YEAR(created_at) = YEAR(CURRENT_DATE())`
      );

      // Nuevas personas este mes
      const [nuevasPersonas] = await readPool.query(
        `SELECT COUNT(*) as total FROM personas
         WHERE activo = 1
         AND MONTH(created_at) = MONTH(CURRENT_DATE())
         AND YEAR(created_at) = YEAR(CURRENT_DATE())`
      );

      return {
        estados: estados[0].total,
        delegaciones: delegaciones[0].total,
        colonias: colonias[0].total,
        familias: familias[0].total,
        personas: personas[0].total,
        votantes: votantes[0].total,
        nuevasFamilias: nuevasFamilias[0].total,
        nuevasPersonas: nuevasPersonas[0].total,
      };
    } catch (error) {
      console.error('Error getting general stats:', error);
      throw new Error('Error al obtener estadísticas generales');
    }
  }

  /**
   * Obtener resumen mensual (últimos 6 meses)
   */
  async getMonthlySummary() {
    try {
      const [familiasPorMes] = await readPool.query(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as mes,
          COUNT(*) as total
        FROM familias
        WHERE activo = 1
        AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY mes ASC
      `);

      const [personasPorMes] = await readPool.query(`
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as mes,
          COUNT(*) as total
        FROM personas
        WHERE activo = 1
        AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY mes ASC
      `);

      return {
        familias: familiasPorMes,
        personas: personasPorMes,
      };
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      throw new Error('Error al obtener resumen mensual');
    }
  }

  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(limit = 10) {
    try {
      const [activities] = await readPool.query(
        `SELECT
          aa.accion as type,
          aa.detalles,
          aa.created_at as timestamp,
          u.nombre as user
        FROM auditoria_accesos aa
        LEFT JOIN usuarios u ON aa.id_usuario = u.id
        WHERE aa.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY aa.created_at DESC
        LIMIT ?`,
        [limit]
      );

      return activities.map((activity) => {
        let description = 'Acción realizada';

        try {
          const details = typeof activity.detalles === 'string'
            ? JSON.parse(activity.detalles)
            : activity.detalles;

          switch (activity.type) {
            case 'LOGIN':
              description = 'Inicio de sesión exitoso';
              break;
            case 'LOGOUT':
              description = 'Cierre de sesión';
              break;
            case 'ACCESO_BLOQUEADO':
              description = 'Intento de acceso bloqueado';
              break;
            case 'UBICACION_RECHAZADA':
              description = 'Ubicación no proporcionada o inválida';
              break;
            default:
              description = activity.type;
          }
        } catch (e) {
          // Si hay error parseando detalles, usar tipo como descripción
          description = activity.type;
        }

        return {
          type: activity.type,
          description,
          user: activity.user || 'Sistema',
          timestamp: activity.timestamp,
        };
      });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error('Error al obtener actividad reciente');
    }
  }
}

module.exports = new DashboardService();
