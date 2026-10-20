const request = require('supertest');
const express = require('express');

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-test-refresh-test-refresh-test';

const mockReadQuery = jest.fn();
const mockWriteQuery = jest.fn();
jest.mock('../config/database', () => ({
  readPool: { query: (...args) => mockReadQuery(...args) },
  writePool: { query: (...args) => mockWriteQuery(...args) },
}));

const cryptoService = require('../services/base/CryptoService');
const authService = require('../services/auth.service');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { sessionCache } = require('../config/cache');

// Fila de `usuarios` como la deja el seed: todo cifrado salvo id/password/activo
async function userRow({ id = 1, nombre, email, rol, activo = 1 }) {
  const [n, e, r] = await Promise.all([cryptoService.encrypt(nombre), cryptoService.encrypt(email), cryptoService.encrypt(rol)]);
  return {
    id, activo, password: 'hash',
    nombre_encrypted: n.encrypted, nombre_iv: n.iv, nombre_tag: n.authTag,
    email_encrypted: e.encrypted, email_iv: e.iv, email_tag: e.authTag,
    rol_encrypted: r.encrypted, rol_iv: r.iv, rol_tag: r.authTag,
  };
}

beforeEach(() => {
  mockReadQuery.mockReset();
  mockWriteQuery.mockReset();
  sessionCache.flushAll();
});

describe('POST /api/auth/register', () => {
  const app = express();
  app.use(express.json());
  app.post('/api/auth/register', (req, res) => authController.register(req, res));

  it('crea el usuario como CAPTURISTA aunque el cliente pida ADMIN', async () => {
    mockReadQuery.mockResolvedValue([[]]);
    mockWriteQuery.mockResolvedValue([{ insertId: 7 }]);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: ' Ana Pérez ', email: 'Ana@Demo.com', password: 'secreto123', rol: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { id: 7, nombre: 'Ana Pérez', email: 'ana@demo.com', rol: 'CAPTURISTA' } });

    // Lo que llega a la BD va cifrado y la contraseña con hash
    const [sql, params] = mockWriteQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO usuarios/);
    expect(params).not.toContain('ana@demo.com');
    expect(params[9]).toMatch(/^\$2[aby]\$/);
    const rolPlano = await cryptoService.decrypt({ encrypted: params[6], iv: params[7], authTag: params[8] });
    expect(rolPlano).toBe('CAPTURISTA');
  });

  it('detecta emails duplicados sin importar mayúsculas', async () => {
    mockReadQuery.mockResolvedValue([[await userRow({ nombre: 'Admin', email: 'test@test.com', rol: 'ADMIN' })]]);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Otro', email: 'TEST@test.com', password: 'secreto123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('El email ya está registrado');
    expect(mockWriteQuery).not.toHaveBeenCalled();
  });

  it.each([
    [{ nombre: '', email: 'a@b.com', password: 'secreto123' }, 'obligatorios'],
    [{ nombre: 'A', email: 'no-es-email', password: 'secreto123' }, 'email no es válido'],
    [{ nombre: 'A', email: 'a@b.com', password: 'corta' }, 'al menos 8'],
  ])('valida la entrada %j', async (body, message) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain(message);
  });
});

describe('authMiddleware.verifyToken con usuarios cifrados', () => {
  const app = express();
  app.get('/whoami', authMiddleware.verifyToken, (req, res) => res.json(req.user));
  app.get('/admin-only', authMiddleware.verifyToken, authMiddleware.requireRole(['ADMIN']), (req, res) => res.json({ ok: true }));

  async function tokenFor(row) {
    const { token, jti } = authMiddleware.generateToken({ id: row.id });
    mockReadQuery.mockImplementation(async (sql) => {
      if (/FROM sesiones/.test(sql)) return [[{ token_jti: jti, is_active: 1 }]];
      if (/FROM usuarios/.test(sql)) return [[row]];
      return [[]];
    });
    return token;
  }

  it('descifra nombre/email/rol y expone userId', async () => {
    const row = await userRow({ id: 3, nombre: 'Carla', email: 'carla@demo.com', rol: 'COORDINADOR' });
    const token = await tokenFor(row);

    const res = await request(app).get('/whoami').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, userId: 3, nombre: 'Carla', email: 'carla@demo.com', rol: 'COORDINADOR' });
  });

  it('aplica requireRole con el rol descifrado', async () => {
    const coordinador = await tokenFor(await userRow({ nombre: 'C', email: 'c@demo.com', rol: 'COORDINADOR' }));
    expect((await request(app).get('/admin-only').set('Authorization', `Bearer ${coordinador}`)).status).toBe(403);

    sessionCache.flushAll();
    const admin = await tokenFor(await userRow({ nombre: 'A', email: 'a@demo.com', rol: 'ADMIN' }));
    expect((await request(app).get('/admin-only').set('Authorization', `Bearer ${admin}`)).status).toBe(200);
  });

  it('rechaza usuarios inactivos', async () => {
    const token = await tokenFor(await userRow({ nombre: 'X', email: 'x@demo.com', rol: 'ADMIN', activo: 0 }));
    const res = await request(app).get('/whoami').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

describe('authService.getCurrentUser', () => {
  it('devuelve el perfil descifrado', async () => {
    mockReadQuery.mockResolvedValue([[await userRow({ id: 9, nombre: 'Luz', email: 'luz@demo.com', rol: 'CAPTURISTA' })]]);
    const user = await authService.getCurrentUser(9);
    expect(user).toMatchObject({ id: 9, nombre: 'Luz', email: 'luz@demo.com', rol: 'CAPTURISTA' });
  });
});
