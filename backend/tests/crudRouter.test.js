const request = require('supertest');
const express = require('express');

// Tabla `casillas` en memoria: responde a las consultas que genera BaseService
const table = [];
let nextId = 1;
const run = async (sql, params = []) => {
  const q = sql.replace(/\s+/g, ' ').trim();
  if (/^INSERT INTO casillas/.test(q)) {
    const cols = /\(([^)]+)\) VALUES/.exec(q)[1].split(',').map((c) => c.trim());
    const row = { id: nextId++, activo: 1 };
    cols.forEach((c, i) => { row[c] = params[i]; });
    table.push(row);
    return [{ insertId: row.id }];
  }
  if (/^UPDATE casillas SET activo = 0/.test(q)) {
    table.find((r) => r.id === Number(params[0])).activo = 0;
    return [{}];
  }
  if (/^UPDATE casillas SET/.test(q)) {
    const cols = /SET (.+), updated_at/.exec(q)[1].split(',').map((c) => c.split('=')[0].trim());
    const row = table.find((r) => r.id === Number(params[cols.length]));
    cols.forEach((c, i) => { row[c] = params[i]; });
    return [{}];
  }
  if (/^SELECT 1 FROM casillas WHERE id = \?/.test(q)) return [table.filter((r) => r.id === Number(params[0]))];
  if (/^SELECT \* FROM casillas WHERE id = \?/.test(q)) return [table.filter((r) => r.id === Number(params[0]))];
  if (/^SELECT (\*|COUNT\(\*\) as total) FROM casillas/.test(q)) {
    const byColonia = /id_colonia = \?/.test(q) ? Number(params[0]) : null;
    const rows = table.filter((r) => r.activo === 1 && (byColonia === null || r.id_colonia === byColonia));
    return [q.startsWith('SELECT COUNT') ? [{ total: rows.length }] : rows];
  }
  throw new Error(`SQL no soportado por el fake: ${q}`);
};

jest.mock('../config/database', () => ({
  readPool: { query: (...a) => run(...a) },
  writePool: { query: (...a) => run(...a) },
}));
jest.mock('../middleware/auth.middleware', () => {
  const actual = jest.requireActual('../middleware/auth.middleware');
  return { ...actual, verifyToken: (req, res, next) => { req.user = { id: 1, userId: 1, rol: req.headers['x-test-role'] || 'ADMIN' }; next(); } };
});

const BaseService = require('../services/base/BaseService');
const authMiddleware = require('../middleware/auth.middleware');
const createCrudRouter = require('../utils/crudRouter');

class CasillasService extends BaseService {
  constructor() { super('casillas', ['direccion']); }
}

const app = express();
app.use(express.json());
app.use('/api/electoral/casillas', authMiddleware.verifyToken, createCrudRouter(new CasillasService(), {
  fields: ['id_colonia', 'numero', 'direccion'],
  required: ['id_colonia', 'numero'],
  filters: ['id_colonia'],
  roles: { create: ['ADMIN', 'COORDINADOR'] },
}));

describe('createCrudRouter + BaseService', () => {
  it('exige lista blanca de campos', () => {
    expect(() => createCrudRouter({}, {})).toThrow(/fields/);
  });

  it('crea, lee, actualiza y elimina (borrado lógico)', async () => {
    const created = await request(app).post('/api/electoral/casillas').send({ id_colonia: 3, numero: 'C-01', direccion: 'Escuela 5' });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ id: 1, id_colonia: 3, numero: 'C-01' });

    // El texto cifrado es lo único que llega a la BD
    expect(table[0].direccion).toBeUndefined();
    expect(table[0].direccion_encrypted).toBeDefined();
    // …y la API lo devuelve descifrado
    expect(created.body.data.direccion).toBe('Escuela 5');

    const list = await request(app).get('/api/electoral/casillas');
    expect(list.body).toMatchObject({ success: true, pagination: { total: 1 } });
    expect(list.body.data[0].direccion).toBe('Escuela 5');

    const updated = await request(app).put('/api/electoral/casillas/1').send({ numero: 'C-02' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.numero).toBe('C-02');

    const removed = await request(app).delete('/api/electoral/casillas/1');
    expect(removed.status).toBe(200);
    expect((await request(app).get('/api/electoral/casillas')).body.data).toHaveLength(0);
  });

  it('ignora campos fuera de la lista blanca (evita inyección por nombre de columna)', async () => {
    const res = await request(app).post('/api/electoral/casillas')
      .send({ id_colonia: 1, numero: 'X', 'activo = 0, id': 9, rol: 'ADMIN' });
    expect(res.status).toBe(201);
    const row = table[table.length - 1];
    expect(Object.keys(row)).not.toContain('rol');
    expect(Object.keys(row)).not.toContain('activo = 0, id');
  });

  it('valida campos requeridos y 404', async () => {
    expect((await request(app).post('/api/electoral/casillas').send({ numero: 'sin colonia' })).status).toBe(400);
    expect((await request(app).get('/api/electoral/casillas/999')).status).toBe(404);
    expect((await request(app).put('/api/electoral/casillas/999').send({ numero: 'x' })).status).toBe(404);
    expect((await request(app).put('/api/electoral/casillas/1').send({ nada: 1 })).status).toBe(400);
  });

  it('filtra por columnas declaradas sin mezclar la caché entre filtros', async () => {
    await request(app).post('/api/electoral/casillas').send({ id_colonia: 20, numero: 'A' });
    await request(app).post('/api/electoral/casillas').send({ id_colonia: 21, numero: 'B' });

    const a = await request(app).get('/api/electoral/casillas').query({ id_colonia: 20 });
    const b = await request(app).get('/api/electoral/casillas').query({ id_colonia: 21 });
    expect(a.body.data.map((r) => r.numero)).toEqual(['A']);
    expect(b.body.data.map((r) => r.numero)).toEqual(['B']);
  });

  it('respeta los roles por acción', async () => {
    const body = { id_colonia: 1, numero: 'R' };
    expect((await request(app).post('/api/electoral/casillas').set('x-test-role', 'CAPTURISTA').send(body)).status).toBe(403);
    expect((await request(app).post('/api/electoral/casillas').set('x-test-role', 'COORDINADOR').send(body)).status).toBe(201);
    expect((await request(app).delete('/api/electoral/casillas/2').set('x-test-role', 'COORDINADOR')).status).toBe(403);
  });
});
