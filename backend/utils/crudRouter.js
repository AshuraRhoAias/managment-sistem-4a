const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { PAGINATION } = require('../config/constants');

/**
 * ============================================
 * FÁBRICA DE RUTAS CRUD
 *
 * Convierte un servicio que extiende BaseService en una API REST completa
 * con el contrato que espera el frontend ({ success, data }):
 *
 *   GET    /        → { success, data: [...], pagination }
 *   GET    /:id     → { success, data: {...} }       (404 si no existe)
 *   POST   /        → 201 { success, data: {...} }
 *   PUT    /:id     → { success, data: {...} }
 *   DELETE /:id     → { success, data: { message } } (borrado lógico)
 *
 * Uso (en routes/electoral.routes.js, que ya exige JWT):
 *   router.use('/casillas', createCrudRouter(casillasService, {
 *     fields: ['id_colonia', 'numero', 'direccion'],   // OBLIGATORIO: lista blanca de columnas
 *     required: ['id_colonia', 'numero'],
 *     roles: { create: ['ADMIN', 'COORDINADOR'] },
 *   }));
 * ============================================
 */

const DEFAULT_ROLES = {
  read: null, // cualquier usuario autenticado
  create: ['ADMIN', 'CAPTURISTA'],
  update: ['ADMIN', 'CAPTURISTA'],
  remove: ['ADMIN'],
};

const fail = (res, status, message) => res.status(status).json({ success: false, message });

function createCrudRouter(service, options = {}) {
  const { fields, required = [], roles = {}, audit = false, filters = [] } = options;

  if (!Array.isArray(fields) || fields.length === 0) {
    // BaseService arma el SQL con los nombres de campo recibidos: sin lista blanca habría inyección SQL.
    throw new Error('createCrudRouter requiere `fields` (lista blanca de columnas permitidas)');
  }

  const allowed = { ...DEFAULT_ROLES, ...roles };
  const guard = (action) => (allowed[action] ? authMiddleware.requireRole(allowed[action]) : (req, res, next) => next());

  const pick = (body = {}) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
  const missing = (data) => required.filter((f) => data[f] === undefined || data[f] === null || data[f] === '');

  const router = express.Router();

  router.get('/', guard('read'), async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE);
      const limit = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT));

      // Filtros por igualdad solo sobre columnas declaradas (siempre parametrizados)
      const active = filters.filter((f) => req.query[f] !== undefined && req.query[f] !== '');
      const where = active.map((f) => `${f} = ?`).join(' AND ');
      const params = active.map((f) => req.query[f]);

      const result = await service.getAll({ page, limit, where: where ? `${where} AND activo = 1` : 'activo = 1', params });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      fail(res, 500, error.message);
    }
  });

  router.get('/:id', guard('read'), async (req, res) => {
    try {
      const record = await service.getById(req.params.id);
      if (!record) return fail(res, 404, 'Registro no encontrado');
      res.json({ success: true, data: record });
    } catch (error) {
      fail(res, 500, error.message);
    }
  });

  router.post('/', guard('create'), async (req, res) => {
    try {
      const data = pick(req.body);
      const absent = missing(data);
      if (absent.length) return fail(res, 400, `Campos requeridos: ${absent.join(', ')}`);

      if (audit) data.id_registro = req.user.userId;
      res.status(201).json({ success: true, data: await service.create(data) });
    } catch (error) {
      fail(res, 400, error.message);
    }
  });

  router.put('/:id', guard('update'), async (req, res) => {
    try {
      const data = pick(req.body);
      if (Object.keys(data).length === 0) return fail(res, 400, 'No hay datos para actualizar');
      if (!(await service.exists(req.params.id))) return fail(res, 404, 'Registro no encontrado');

      if (audit) data.id_ultima_modificacion = req.user.userId;
      res.json({ success: true, data: await service.update(req.params.id, data) });
    } catch (error) {
      fail(res, 400, error.message);
    }
  });

  router.delete('/:id', guard('remove'), async (req, res) => {
    try {
      if (!(await service.exists(req.params.id))) return fail(res, 404, 'Registro no encontrado');
      await service.delete(req.params.id);
      res.json({ success: true, data: { message: 'Registro eliminado exitosamente' } });
    } catch (error) {
      fail(res, 400, error.message);
    }
  });

  return router;
}

module.exports = createCrudRouter;
