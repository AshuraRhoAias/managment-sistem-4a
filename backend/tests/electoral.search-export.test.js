const request = require('supertest');
const express = require('express');

jest.mock('../config/database', () => ({ readPool: { query: jest.fn() }, writePool: { query: jest.fn() } }));

// verifyToken falso: el rol sale del header x-test-role. requireRole es el real.
jest.mock('../middleware/auth.middleware', () => {
  const actual = jest.requireActual('../middleware/auth.middleware');
  return {
    ...actual,
    verifyToken: (req, res, next) => {
      req.user = { id: 1, userId: 1, rol: req.headers['x-test-role'] || 'ADMIN' };
      next();
    },
  };
});

const personasService = require('../services/personas.service');
const familiasService = require('../services/familias.service');
const estadosService = require('../services/estados.service');
const delegacionesService = require('../services/delegaciones.service');
const coloniasService = require('../services/colonias.service');
const electoralRoutes = require('../routes/electoral.routes');

const app = express();
app.use(express.json());
app.use('/api/electoral', electoralRoutes);

beforeEach(() => {
  jest.spyOn(personasService, 'getAllPersonas').mockResolvedValue([
    { id: 1, id_familia: 10, nombre: 'María López Ruiz', curp: 'LORM900101MDFPZR01', telefono: '5512345678', edad: 34, genero: 'FEMENINO', rol_familia: 'JEFE DE FAMILIA', puede_votar: true },
    { id: 2, id_familia: 10, nombre: 'Luis López Ruiz', curp: 'LORL100101HDFPZS02', telefono: null, edad: 12, genero: 'MASCULINO', rol_familia: 'MIEMBRO', puede_votar: false },
    { id: 3, id_familia: 11, nombre: 'Pedro, "El Grande" Soto', curp: 'SOTP800101HDFXXX03', telefono: null, edad: 44, genero: 'MASCULINO', rol_familia: 'JEFE DE FAMILIA', puede_votar: true },
  ]);
  jest.spyOn(familiasService, 'getAllFamilias').mockResolvedValue([
    { id: 10, id_colonia: 100, nombre_familia: 'López Ruiz', direccion: 'Calle Reforma 123', estado: 'ACTIVA' },
    { id: 11, id_colonia: 100, nombre_familia: 'Soto', direccion: '=HYPERLINK("x")', estado: 'ACTIVA' },
  ]);
  jest.spyOn(coloniasService, 'getAllColonias').mockResolvedValue([{ id: 100, id_delegacion: 50, nombre: 'Centro' }]);
  jest.spyOn(delegacionesService, 'getAllDelegaciones').mockResolvedValue([{ id: 50, id_estado: 5, nombre: 'Cuauhtémoc' }]);
  jest.spyOn(estadosService, 'getAllEstados').mockResolvedValue([{ id: 5, codigo: 'CDMX', nombre: 'Ciudad de México' }]);
});

afterEach(() => jest.restoreAllMocks());

describe('GET /api/electoral/search', () => {
  it('busca por CURP sin distinguir mayúsculas', async () => {
    const res = await request(app).get('/api/electoral/search').query({ q: 'lorl1001' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ id: 2, familia: 'López Ruiz', direccion: 'Calle Reforma 123' });
  });

  it('busca por teléfono y por dirección de la familia', async () => {
    const byPhone = await request(app).get('/api/electoral/search').query({ q: '5512345678' });
    expect(byPhone.body.data.map((p) => p.id)).toEqual([1]);

    const byAddress = await request(app).get('/api/electoral/search').query({ q: 'reforma' });
    expect(byAddress.body.data.map((p) => p.id)).toEqual([1, 2]);
  });

  it('rechaza términos demasiado cortos', async () => {
    const res = await request(app).get('/api/electoral/search').query({ q: 'a' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/electoral/export/:type', () => {
  it('exporta familias en CSV con ubicación completa', async () => {
    const res = await request(app).get('/api/electoral/export/families').query({ format: 'csv' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="families-\d{4}-\d{2}-\d{2}\.csv"/);

    const lines = res.text.replace(/^﻿/, '').split('\r\n');
    expect(lines[0]).toBe('ID,Familia,Jefe de familia,Estado,Delegación,Colonia,Dirección,Personas,Situación');
    expect(lines[1]).toBe('10,López Ruiz,María López Ruiz,Ciudad de México,Cuauhtémoc,Centro,Calle Reforma 123,2,ACTIVA');
  });

  it('neutraliza fórmulas y escapa comillas', async () => {
    const res = await request(app).get('/api/electoral/export/families');
    expect(res.text).toContain(`"'=HYPERLINK(""x"")"`);

    const persons = await request(app).get('/api/electoral/export/persons');
    expect(persons.text).toContain('"Pedro, ""El Grande"" Soto"');
  });

  it('rechaza tipos y formatos desconocidos', async () => {
    expect((await request(app).get('/api/electoral/export/usuarios')).status).toBe(400);
    expect((await request(app).get('/api/electoral/export/families').query({ format: 'xlsx' })).status).toBe(400);
  });

  it('solo permite ADMIN y COORDINADOR', async () => {
    const forbidden = await request(app).get('/api/electoral/export/persons').set('x-test-role', 'CAPTURISTA');
    expect(forbidden.status).toBe(403);

    const allowed = await request(app).get('/api/electoral/export/persons').set('x-test-role', 'COORDINADOR');
    expect(allowed.status).toBe(200);
  });
});
