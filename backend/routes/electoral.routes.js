/**
 * ============================================
 * RUTAS: SISTEMA ELECTORAL
 * Todas las rutas para gestión electoral
 * ============================================
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Servicios
const estadosService = require('../services/estados.service');
const delegacionesService = require('../services/delegaciones.service');
const coloniasService = require('../services/colonias.service');
const familiasService = require('../services/familias.service');
const personasService = require('../services/personas.service');
const dashboardService = require('../services/dashboard.service');

/**
 * ============================================
 * MIDDLEWARE: Validar autenticación en todas las rutas
 * ============================================
 */
router.use(authMiddleware.verifyToken);

/**
 * ============================================
 * DASHBOARD
 * ============================================
 */

// GET /api/electoral/stats - Obtener estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const stats = await dashboardService.getGeneralStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/monthly-summary - Obtener resumen mensual
router.get('/monthly-summary', async (req, res) => {
  try {
    const summary = await dashboardService.getMonthlySummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/recent-activity - Obtener actividad reciente
router.get('/recent-activity', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const activity = await dashboardService.getRecentActivity(limit);
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ============================================
 * ESTADOS
 * ============================================
 */

// GET /api/electoral/states - Obtener todos los estados
router.get('/states', async (req, res) => {
  try {
    const estados = await estadosService.getAllEstados();
    res.json({
      success: true,
      data: estados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/states/:id - Obtener estado por ID
router.get('/states/:id', async (req, res) => {
  try {
    const estado = await estadosService.getEstadoById(req.params.id);
    res.json({
      success: true,
      data: estado
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/electoral/states - Crear nuevo estado
router.post('/states', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await estadosService.createEstado(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/electoral/states/:id - Actualizar estado
router.put('/states/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await estadosService.updateEstado(req.params.id, req.body, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/electoral/states/:id - Eliminar estado
router.delete('/states/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await estadosService.deleteEstado(req.params.id, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/states/:id/delegations - Obtener delegaciones de un estado
router.get('/states/:id/delegations', async (req, res) => {
  try {
    const delegaciones = await estadosService.getDelegacionesByEstado(req.params.id);
    res.json({
      success: true,
      data: delegaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ============================================
 * DELEGACIONES
 * ============================================
 */

// GET /api/electoral/delegations - Obtener todas las delegaciones
router.get('/delegations', async (req, res) => {
  try {
    const delegaciones = await delegacionesService.getAllDelegaciones();
    res.json({
      success: true,
      data: delegaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/delegations/:id - Obtener delegación por ID
router.get('/delegations/:id', async (req, res) => {
  try {
    const delegacion = await delegacionesService.getDelegacionById(req.params.id);
    res.json({
      success: true,
      data: delegacion
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/electoral/delegations - Crear nueva delegación
router.post('/delegations', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await delegacionesService.createDelegacion(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/electoral/delegations/:id - Actualizar delegación
router.put('/delegations/:id', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await delegacionesService.updateDelegacion(req.params.id, req.body, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/electoral/delegations/:id - Eliminar delegación
router.delete('/delegations/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await delegacionesService.deleteDelegacion(req.params.id, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/delegations/:id/colonies - Obtener colonias de una delegación
router.get('/delegations/:id/colonies', async (req, res) => {
  try {
    const colonias = await coloniasService.getColoniasByDelegacion(req.params.id);
    res.json({
      success: true,
      data: colonias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ============================================
 * COLONIAS
 * ============================================
 */

// GET /api/electoral/colonies - Obtener todas las colonias
router.get('/colonies', async (req, res) => {
  try {
    const colonias = await coloniasService.getAllColonias();
    res.json({
      success: true,
      data: colonias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/colonies/:id - Obtener colonia por ID
router.get('/colonies/:id', async (req, res) => {
  try {
    const colonia = await coloniasService.getColoniaById(req.params.id);
    res.json({
      success: true,
      data: colonia
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/electoral/colonies - Crear nueva colonia
router.post('/colonies', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await coloniasService.createColonia(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/electoral/colonies/:id - Actualizar colonia
router.put('/colonies/:id', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await coloniasService.updateColonia(req.params.id, req.body, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/electoral/colonies/:id - Eliminar colonia
router.delete('/colonies/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await coloniasService.deleteColonia(req.params.id, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ============================================
 * FAMILIAS
 * ============================================
 */

// GET /api/electoral/families - Obtener todas las familias
router.get('/families', async (req, res) => {
  try {
    const filters = {
      colonia_id: req.query.colonia_id,
      estado_familia: req.query.estado
    };
    const familias = await familiasService.getAllFamilias(filters);
    res.json({
      success: true,
      data: familias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/families/:id - Obtener familia por ID con sus personas
router.get('/families/:id', async (req, res) => {
  try {
    const familia = await familiasService.getFamiliaById(req.params.id);
    res.json({
      success: true,
      data: familia
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/families/:id/stats - Obtener estadísticas de una familia
router.get('/families/:id/stats', async (req, res) => {
  try {
    const stats = await familiasService.getFamiliaStats(req.params.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/electoral/families - Crear nueva familia
router.post('/families', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await familiasService.createFamilia(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/electoral/families/:id - Actualizar familia
router.put('/families/:id', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await familiasService.updateFamilia(req.params.id, req.body, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/electoral/families/:id - Eliminar familia
router.delete('/families/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await familiasService.deleteFamilia(req.params.id, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * ============================================
 * PERSONAS
 * ============================================
 */

// GET /api/electoral/persons - Obtener todas las personas
router.get('/persons', async (req, res) => {
  try {
    const filters = {
      familia_id: req.query.familia_id,
      puede_votar: req.query.puede_votar,
      limit: req.query.limit
    };
    const personas = await personasService.getAllPersonas(filters);
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/persons/stats - Obtener estadísticas generales
router.get('/persons/stats', async (req, res) => {
  try {
    const stats = await personasService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/persons/:id - Obtener persona por ID
router.get('/persons/:id', async (req, res) => {
  try {
    const persona = await personasService.getPersonaById(req.params.id);
    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/electoral/search/curp/:curp - Buscar persona por CURP
router.get('/search/curp/:curp', async (req, res) => {
  try {
    const persona = await personasService.searchByCurp(req.params.curp);
    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/electoral/persons - Crear nueva persona
router.post('/persons', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await personasService.createPersona(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/electoral/persons/:id - Actualizar persona
router.put('/persons/:id', authMiddleware.requireRole(['ADMIN', 'CAPTURISTA']), async (req, res) => {
  try {
    const result = await personasService.updatePersona(req.params.id, req.body, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/electoral/persons/:id - Eliminar persona
router.delete('/persons/:id', authMiddleware.requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await personasService.deletePersona(req.params.id, req.user.userId);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
