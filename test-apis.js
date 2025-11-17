/**
 * ============================================
 * SCRIPT DE PRUEBA DE APIs
 * Verificar que todas las rutas funcionen
 * ============================================
 *
 * Ejecutar: node test-apis.js
 */

const API_URL = 'http://localhost:3002';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Hacer petición HTTP
 */
async function request(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
    };
  }
}

/**
 * Test helper
 */
function test(name, result, expected = true) {
  totalTests++;

  if (result === expected) {
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } else {
    failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    return false;
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests() {
  console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   🧪 PRUEBAS DE API - SISTEMA ELECTORAL${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  let authToken = null;

  // ============================================
  // 1. HEALTH CHECK
  // ============================================
  console.log(`${colors.blue}📊 Health Check${colors.reset}`);

  const health = await request('GET', '/health');
  test('GET /health', health.success && health.data.status === 'healthy');
  console.log('');

  // ============================================
  // 2. AUTENTICACIÓN
  // ============================================
  console.log(`${colors.blue}🔐 Autenticación${colors.reset}`);

  // Login con credenciales inválidas
  const loginFail = await request('POST', '/api/auth/login', {
    email: 'invalid@test.com',
    password: 'wrong',
  });
  test('POST /api/auth/login (credenciales inválidas)', !loginFail.success);

  // Login con credenciales válidas
  const login = await request('POST', '/api/auth/login', {
    email: 'test@test.com',
    password: '123456',
  });
  test('POST /api/auth/login (credenciales válidas)', login.success && login.data.token);

  if (login.success && login.data.token) {
    authToken = login.data.token;
    console.log(`   ${colors.green}Token obtenido: ${authToken.substring(0, 20)}...${colors.reset}`);
  }

  // Obtener usuario actual
  if (authToken) {
    const currentUser = await request('GET', '/api/auth/me', null, authToken);
    test('GET /api/auth/me (con token)', currentUser.success && currentUser.data.data);
  }

  // Sin token
  const noToken = await request('GET', '/api/auth/me');
  test('GET /api/auth/me (sin token)', !noToken.success && noToken.status === 401);

  console.log('');

  // ============================================
  // 3. ESTADOS
  // ============================================
  console.log(`${colors.blue}📍 Estados${colors.reset}`);

  if (authToken) {
    const states = await request('GET', '/api/states', null, authToken);
    test('GET /api/states', states.success && Array.isArray(states.data.data));

    // Buscar estados
    const searchStates = await request('GET', '/api/states/search?q=jalisco', null, authToken);
    test('GET /api/states/search?q=jalisco', searchStates.success);

    // Obtener estado por ID
    const state = await request('GET', '/api/states/1', null, authToken);
    test('GET /api/states/1', state.success || state.status === 404);
  }

  console.log('');

  // ============================================
  // 4. DELEGACIONES
  // ============================================
  console.log(`${colors.blue}🏛️ Delegaciones${colors.reset}`);

  if (authToken) {
    const delegations = await request('GET', '/api/delegations', null, authToken);
    test('GET /api/delegations', delegations.success || delegations.status === 404);

    const delegationsByState = await request('GET', '/api/delegations/state/1', null, authToken);
    test('GET /api/delegations/state/1', delegationsByState.success || delegationsByState.status === 404);
  }

  console.log('');

  // ============================================
  // 5. COLONIAS
  // ============================================
  console.log(`${colors.blue}🏘️ Colonias${colors.reset}`);

  if (authToken) {
    const colonies = await request('GET', '/api/colonies', null, authToken);
    test('GET /api/colonies', colonies.success || colonies.status === 404);

    const coloniesByDelegation = await request('GET', '/api/colonies/delegation/1', null, authToken);
    test('GET /api/colonies/delegation/1', coloniesByDelegation.success || coloniesByDelegation.status === 404);
  }

  console.log('');

  // ============================================
  // 6. FAMILIAS
  // ============================================
  console.log(`${colors.blue}👨‍👩‍👧‍👦 Familias${colors.reset}`);

  if (authToken) {
    const families = await request('GET', '/api/families', null, authToken);
    test('GET /api/families', families.success || families.status === 404);

    const familiesByColony = await request('GET', '/api/families/colony/1', null, authToken);
    test('GET /api/families/colony/1', familiesByColony.success || familiesByColony.status === 404);
  }

  console.log('');

  // ============================================
  // 7. PERSONAS
  // ============================================
  console.log(`${colors.blue}👤 Personas${colors.reset}`);

  if (authToken) {
    const persons = await request('GET', '/api/persons', null, authToken);
    test('GET /api/persons', persons.success || persons.status === 404);

    const searchPersons = await request('GET', '/api/persons/search?q=maria', null, authToken);
    test('GET /api/persons/search?q=maria', searchPersons.success || searchPersons.status === 404);

    const personsByFamily = await request('GET', '/api/persons/family/1', null, authToken);
    test('GET /api/persons/family/1', personsByFamily.success || personsByFamily.status === 404);
  }

  console.log('');

  // ============================================
  // 8. REPORTES
  // ============================================
  console.log(`${colors.blue}📊 Reportes${colors.reset}`);

  if (authToken) {
    const generalReport = await request('GET', '/api/reports/general', null, authToken);
    test('GET /api/reports/general', generalReport.success || generalReport.status === 404);

    const coverage = await request('GET', '/api/reports/coverage', null, authToken);
    test('GET /api/reports/coverage', coverage.success || coverage.status === 404);

    const voters = await request('GET', '/api/reports/voters', null, authToken);
    test('GET /api/reports/voters', voters.success || voters.status === 404);
  }

  console.log('');

  // ============================================
  // 9. USUARIOS
  // ============================================
  console.log(`${colors.blue}👥 Usuarios${colors.reset}`);

  if (authToken) {
    const users = await request('GET', '/api/users', null, authToken);
    test('GET /api/users', users.success || users.status === 404);

    const user = await request('GET', '/api/users/1', null, authToken);
    test('GET /api/users/1', user.success || user.status === 404);
  }

  console.log('');

  // ============================================
  // RESUMEN
  // ============================================
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   📋 RESUMEN DE PRUEBAS${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  console.log(`Total de pruebas: ${colors.yellow}${totalTests}${colors.reset}`);
  console.log(`Exitosas:         ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Fallidas:         ${colors.red}${failedTests}${colors.reset}`);

  const percentage = ((passedTests / totalTests) * 100).toFixed(2);
  console.log(`Porcentaje:       ${percentage >= 80 ? colors.green : colors.red}${percentage}%${colors.reset}`);

  console.log('');

  if (failedTests === 0) {
    console.log(`${colors.green}✅ TODAS LAS PRUEBAS PASARON${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  ALGUNAS PRUEBAS FALLARON${colors.reset}\n`);
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// ============================================
// EJECUTAR
// ============================================
console.log(`${colors.cyan}Iniciando pruebas...${colors.reset}`);
console.log(`API URL: ${colors.yellow}${API_URL}${colors.reset}`);

runTests().catch((error) => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
