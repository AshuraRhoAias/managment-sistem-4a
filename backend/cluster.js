const cluster = require('cluster');
const os = require('os');

/**
 * ============================================
 * CLUSTERING PARA ALTA DISPONIBILIDAD
 * ============================================
 */

const WORKERS = process.env.CLUSTER_WORKERS === 'auto'
  ? os.cpus().length
  : parseInt(process.env.CLUSTER_WORKERS) || os.cpus().length;

if (cluster.isMaster || cluster.isPrimary) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 MODO CLUSTER ACTIVADO`);
  console.log(`📊 CPUs disponibles: ${os.cpus().length}`);
  console.log(`👷 Workers a crear: ${WORKERS}`);
  console.log(`${'='.repeat(60)}\n`);

  // Crear workers
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  // Si un worker muere, crear uno nuevo
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️  Worker ${worker.process.pid} murió (${signal || code}). Reiniciando...`);
    cluster.fork();
  });

  // Log de workers iniciados
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} iniciado`);
  });

} else {
  // Workers ejecutan el servidor
  require('./server.js');
}
