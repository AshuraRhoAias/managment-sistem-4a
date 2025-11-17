const { writePool, readPool } = require('./config/database');
const cryptoService = require('./services/base/CryptoService');

async function seedData() {
  console.log('🌱 Insertando familias y personas de prueba...\n');

  try {
    // Obtener ID del usuario test
    const [users] = await readPool.query('SELECT id FROM usuarios WHERE email = ?', ['test@test.com']);
    if (users.length === 0) {
      throw new Error('Usuario test@test.com no encontrado');
    }
    const userId = users[0].id;

    // Obtener IDs de colonias existentes
    const [colonias] = await readPool.query('SELECT id, nombre FROM colonias ORDER BY id LIMIT 10');
    console.log(`✅ Encontradas ${colonias.length} colonias\n`);

    // Insertar familias
    console.log('👨‍👩‍👧‍👦 Insertando familias...');
    const familias = [
      { colonia_id: colonias[0]?.id || 1, nombre: 'López García', direccion: 'Calle Morelos #123' },
      { colonia_id: colonias[0]?.id || 1, nombre: 'Martínez Hernández', direccion: 'Av. Juárez #456' },
      { colonia_id: colonias[1]?.id || 2, nombre: 'González Pérez', direccion: 'Calle Hidalgo #789' },
      { colonia_id: colonias[1]?.id || 2, nombre: 'Rodríguez Sánchez', direccion: 'Calle Zaragoza #321' },
      { colonia_id: colonias[0]?.id || 1, nombre: 'Ramírez Torres', direccion: 'Av. Insurgentes #654' },
      { colonia_id: colonias[0]?.id || 1, nombre: 'Flores Morales', direccion: 'Calle Madero #987' },
      { colonia_id: colonias[1]?.id || 2, nombre: 'Castro Ruiz', direccion: 'Av. México #147' },
      { colonia_id: colonias[1]?.id || 2, nombre: 'Mendoza Silva', direccion: 'Calle Morelos #258' }
    ];

    const familyIds = [];
    for (const familia of familias) {
      const direccionCifrada = await cryptoService.encrypt(familia.direccion);

      const [result] = await writePool.query(
        `INSERT INTO familias (id_colonia, nombre_familia, direccion_encrypted, direccion_iv, direccion_tag, estado, id_registro)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          familia.colonia_id,
          familia.nombre,
          direccionCifrada.encrypted,
          direccionCifrada.iv,
          direccionCifrada.authTag,
          'ACTIVA',
          userId
        ]
      );
      familyIds.push(result.insertId);
    }
    console.log(`✅ ${familias.length} familias insertadas\n`);

    // Insertar personas
    console.log('👥 Insertando personas...');
    const personas = [
      // Familia López García
      { idx: 0, nombre: 'Juan Carlos López García', curp: 'LOGJ790315HDFLRN09', edad: 45, genero: 'MASCULINO', fecha: '1979-03-15', rol: 'JEFE DE FAMILIA', telefono: '5512345678' },
      { idx: 0, nombre: 'María Guadalupe García Pérez', curp: 'GAPM820722MDFRRD07', edad: 42, genero: 'FEMENINO', fecha: '1982-07-22', rol: 'MIEMBRO', telefono: '5512345679' },
      { idx: 0, nombre: 'Carlos Alberto López García', curp: 'LOGC041110HDFLRR05', edad: 20, genero: 'MASCULINO', fecha: '2004-11-10', rol: 'MIEMBRO', telefono: '' },
      { idx: 0, nombre: 'Ana Sofía López García', curp: 'LOGA070518MDFLRN03', edad: 17, genero: 'FEMENINO', fecha: '2007-05-18', rol: 'MIEMBRO', telefono: '' },

      // Familia Martínez Hernández
      { idx: 1, nombre: 'Roberto Martínez Hernández', curp: 'MAHR860120HDFRRT08', edad: 38, genero: 'MASCULINO', fecha: '1986-01-20', rol: 'JEFE DE FAMILIA', telefono: '5523456789' },
      { idx: 1, nombre: 'Laura Hernández Díaz', curp: 'HEDL890914MDFRRL06', edad: 35, genero: 'FEMENINO', fecha: '1989-09-14', rol: 'MIEMBRO', telefono: '5523456790' },
      { idx: 1, nombre: 'Diego Martínez Hernández', curp: 'MAHD120425HDFRRT04', edad: 12, genero: 'MASCULINO', fecha: '2012-04-25', rol: 'MIEMBRO', telefono: '' },

      // Familia González Pérez
      { idx: 2, nombre: 'Patricia González Pérez', curp: 'GOPP721208MDFLRT09', edad: 52, genero: 'FEMENINO', fecha: '1972-12-08', rol: 'JEFE DE FAMILIA', telefono: '5534567890' },
      { idx: 2, nombre: 'Sofía González Ramírez', curp: 'GORS990630MDFLMF05', edad: 25, genero: 'FEMENINO', fecha: '1999-06-30', rol: 'MIEMBRO', telefono: '5534567891' },

      // Familia Rodríguez Sánchez
      { idx: 3, nombre: 'Miguel Ángel Rodríguez Sánchez', curp: 'ROSM830805HDFDGN07', edad: 41, genero: 'MASCULINO', fecha: '1983-08-05', rol: 'JEFE DE FAMILIA', telefono: '5545678901' },
      { idx: 3, nombre: 'Elena Sánchez López', curp: 'SALE850219MDFLPN04', edad: 39, genero: 'FEMENINO', fecha: '1985-02-19', rol: 'MIEMBRO', telefono: '5545678902' },
      { idx: 3, nombre: 'Luis Miguel Rodríguez Sánchez', curp: 'ROSL091012HDFDGS06', edad: 15, genero: 'MASCULINO', fecha: '2009-10-12', rol: 'MIEMBRO', telefono: '' },

      // Más familias
      { idx: 4, nombre: 'José Ramírez Torres', curp: 'RATJ691120HDFRRS05', edad: 55, genero: 'MASCULINO', fecha: '1969-11-20', rol: 'JEFE DE FAMILIA', telefono: '5556789012' },
      { idx: 4, nombre: 'Carmen Torres Vega', curp: 'TOVC710415MDFLRR07', edad: 53, genero: 'FEMENINO', fecha: '1971-04-15', rol: 'MIEMBRO', telefono: '5556789013' },

      { idx: 5, nombre: 'Andrea Flores Morales', curp: 'FOMA950708MDFLRN09', edad: 29, genero: 'FEMENINO', fecha: '1995-07-08', rol: 'JEFE DE FAMILIA', telefono: '3312345678' },

      { idx: 6, nombre: 'Fernando Castro Ruiz', curp: 'CARF760923HDFTRD05', edad: 48, genero: 'MASCULINO', fecha: '1976-09-23', rol: 'JEFE DE FAMILIA', telefono: '3323456789' },
      { idx: 6, nombre: 'Gabriela Ruiz Mendoza', curp: 'RUMG790130MDFLZB08', edad: 45, genero: 'FEMENINO', fecha: '1979-01-30', rol: 'MIEMBRO', telefono: '3323456790' },

      { idx: 7, nombre: 'Alberto Mendoza Silva', curp: 'MESA911212HDFLLL07', edad: 33, genero: 'MASCULINO', fecha: '1991-12-12', rol: 'JEFE DE FAMILIA', telefono: '8112345678' },
      { idx: 7, nombre: 'Mónica Silva Cortés', curp: 'SICM930525MDFLRN06', edad: 31, genero: 'FEMENINO', fecha: '1993-05-25', rol: 'MIEMBRO', telefono: '8112345679' }
    ];

    for (const p of personas) {
      const nombreCifrado = await cryptoService.encrypt(p.nombre);
      const curpCifrado = await cryptoService.encrypt(p.curp);
      const telefonoCifrado = p.telefono ? await cryptoService.encrypt(p.telefono) : null;

      await writePool.query(
        `INSERT INTO personas (
          id_familia, nombre_encrypted, nombre_iv, nombre_tag,
          curp_encrypted, curp_iv, curp_tag,
          telefono_encrypted, telefono_iv, telefono_tag,
          edad, genero, fecha_nacimiento, rol_familia, activo, id_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          familyIds[p.idx],
          nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag,
          curpCifrado.encrypted, curpCifrado.iv, curpCifrado.authTag,
          telefonoCifrado?.encrypted || null,
          telefonoCifrado?.iv || null,
          telefonoCifrado?.authTag || null,
          p.edad, p.genero, p.fecha, p.rol, 1, userId
        ]
      );
    }
    console.log(`✅ ${personas.length} personas insertadas\n`);

    // Resumen final
    const [totalFamilias] = await readPool.query('SELECT COUNT(*) as total FROM familias');
    const [totalPersonas] = await readPool.query('SELECT COUNT(*) as total FROM personas');

    console.log('═══════════════════════════════════════');
    console.log('✅ DATOS INSERTADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Familias:  ${totalFamilias[0].total}`);
    console.log(`📊 Total Personas:  ${totalPersonas[0].total}`);
    console.log('═══════════════════════════════════════\n');
    console.log('🔐 Credenciales:');
    console.log('   Email:    test@test.com');
    console.log('   Password: 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
