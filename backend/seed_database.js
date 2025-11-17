const { writePool } = require('./config/database');
const cryptoService = require('./services/base/CryptoService');
const bcrypt = require('bcryptjs');

/**
 * Script para generar datos de prueba en la base de datos
 * Usuario: test@test.com
 * Password: 123456
 */

async function seedDatabase() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  try {
    // 1. Crear usuario de prueba
    console.log('👤 Creando usuario de prueba...');
    const passwordHash = await bcrypt.hash('123456', 12);

    const [userResult] = await writePool.query(
      'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
      ['Usuario de Prueba', 'test@test.com', passwordHash, 'ADMIN', 1]
    );

    const userId = userResult.insertId;
    console.log('✅ Usuario creado con ID:', userId);
    console.log('   Email: test@test.com');
    console.log('   Password: 123456\n');

    // 2. Insertar estados
    console.log('🗺️  Insertando estados...');
    const estados = [
      ['CDMX', 'Ciudad de México'],
      ['JAL', 'Jalisco'],
      ['NL', 'Nuevo León'],
      ['MEX', 'Estado de México'],
      ['PUE', 'Puebla']
    ];

    for (const [codigo, nombre] of estados) {
      await writePool.query(
        'INSERT INTO estados (codigo, nombre, activo) VALUES (?, ?, ?)',
        [codigo, nombre, 1]
      );
    }
    console.log('✅ 5 estados insertados\n');

    // 3. Insertar delegaciones
    console.log('🏛️  Insertando delegaciones...');
    const [cdmxResult] = await writePool.query('SELECT id FROM estados WHERE codigo = ?', ['CDMX']);
    const cdmxId = cdmxResult[0].id;

    const [jalResult] = await writePool.query('SELECT id FROM estados WHERE codigo = ?', ['JAL']);
    const jalId = jalResult[0].id;

    const [nlResult] = await writePool.query('SELECT id FROM estados WHERE codigo = ?', ['NL']);
    const nlId = nlResult[0].id;

    const delegaciones = [
      [cdmxId, 'Iztapalapa'],
      [cdmxId, 'Gustavo A. Madero'],
      [cdmxId, 'Álvaro Obregón'],
      [jalId, 'Guadalajara'],
      [jalId, 'Zapopan'],
      [nlId, 'Monterrey'],
      [nlId, 'San Pedro Garza García']
    ];

    for (const [idEstado, nombre] of delegaciones) {
      await writePool.query(
        'INSERT INTO delegaciones (id_estado, nombre, activo) VALUES (?, ?, ?)',
        [idEstado, nombre, 1]
      );
    }
    console.log('✅ 7 delegaciones insertadas\n');

    // 4. Insertar colonias
    console.log('🏘️  Insertando colonias...');
    const [iztaResult] = await writePool.query('SELECT id FROM delegaciones WHERE nombre = ?', ['Iztapalapa']);
    const iztaId = iztaResult[0].id;

    const [gamResult] = await writePool.query('SELECT id FROM delegaciones WHERE nombre = ?', ['Gustavo A. Madero']);
    const gamId = gamResult[0].id;

    const [gdlResult] = await writePool.query('SELECT id FROM delegaciones WHERE nombre = ?', ['Guadalajara']);
    const gdlId = gdlResult[0].id;

    const [mtyResult] = await writePool.query('SELECT id FROM delegaciones WHERE nombre = ?', ['Monterrey']);
    const mtyId = mtyResult[0].id;

    const colonias = [
      [iztaId, 'Santa Cruz Meyehualco', '09290'],
      [iztaId, 'Ampliación Emiliano Zapata', '09209'],
      [iztaId, 'San Lorenzo Tezonco', '09790'],
      [gamId, 'Lindavista', '07300'],
      [gamId, 'La Villa', '07050'],
      [gdlId, 'Centro', '44100'],
      [gdlId, 'Providencia', '44630'],
      [gdlId, 'Americana', '44160'],
      [mtyId, 'Centro', '64000'],
      [mtyId, 'Obispado', '64060']
    ];

    for (const [idDelegacion, nombre, cp] of colonias) {
      await writePool.query(
        'INSERT INTO colonias (id_delegacion, nombre, codigo_postal, activo) VALUES (?, ?, ?, ?)',
        [idDelegacion, nombre, cp, 1]
      );
    }
    console.log('✅ 10 colonias insertadas\n');

    // 5. Insertar familias con cifrado
    console.log('👨‍👩‍👧‍👦 Insertando familias (con cifrado)...');
    const familias = [
      { colonia_id: 1, nombre: 'López García', direccion: 'Calle Morelos #123, Col. Santa Cruz Meyehualco' },
      { colonia_id: 1, nombre: 'Martínez Hernández', direccion: 'Av. Juárez #456, Col. Santa Cruz Meyehualco' },
      { colonia_id: 2, nombre: 'González Pérez', direccion: 'Calle Hidalgo #789, Col. Ampliación Emiliano Zapata' },
      { colonia_id: 3, nombre: 'Rodríguez Sánchez', direccion: 'Calle Zaragoza #321, Col. San Lorenzo Tezonco' },
      { colonia_id: 4, nombre: 'Ramírez Torres', direccion: 'Av. Insurgentes #654, Col. Lindavista' },
      { colonia_id: 6, nombre: 'Flores Morales', direccion: 'Calle Madero #987, Centro, Guadalajara' },
      { colonia_id: 7, nombre: 'Castro Ruiz', direccion: 'Av. México #147, Providencia, Guadalajara' },
      { colonia_id: 9, nombre: 'Mendoza Silva', direccion: 'Calle Morelos #258, Centro, Monterrey' }
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
    console.log('✅ 8 familias insertadas (direcciones cifradas)\n');

    // 6. Insertar personas con cifrado
    console.log('👥 Insertando personas (con cifrado)...');
    const personas = [
      // Familia 1: López García
      { familia_idx: 0, nombre: 'Juan Carlos López García', curp: 'LOGJ790315HDFLRN09', edad: 45, genero: 'MASCULINO', fecha: '1979-03-15', rol: 'JEFE DE FAMILIA', telefono: '5512345678' },
      { familia_idx: 0, nombre: 'María Guadalupe García Pérez', curp: 'GAPM820722MDFRRD07', edad: 42, genero: 'FEMENINO', fecha: '1982-07-22', rol: 'MIEMBRO', telefono: '5512345679' },
      { familia_idx: 0, nombre: 'Carlos Alberto López García', curp: 'LOGC041110HDFLRR05', edad: 20, genero: 'MASCULINO', fecha: '2004-11-10', rol: 'MIEMBRO', telefono: '' },
      { familia_idx: 0, nombre: 'Ana Sofía López García', curp: 'LOGA070518MDFLRN03', edad: 17, genero: 'FEMENINO', fecha: '2007-05-18', rol: 'MIEMBRO', telefono: '' },

      // Familia 2: Martínez Hernández
      { familia_idx: 1, nombre: 'Roberto Martínez Hernández', curp: 'MAHR860120HDFRRT08', edad: 38, genero: 'MASCULINO', fecha: '1986-01-20', rol: 'JEFE DE FAMILIA', telefono: '5523456789' },
      { familia_idx: 1, nombre: 'Laura Hernández Díaz', curp: 'HEDL890914MDFRRL06', edad: 35, genero: 'FEMENINO', fecha: '1989-09-14', rol: 'MIEMBRO', telefono: '5523456790' },
      { familia_idx: 1, nombre: 'Diego Martínez Hernández', curp: 'MAHD120425HDFRRT04', edad: 12, genero: 'MASCULINO', fecha: '2012-04-25', rol: 'MIEMBRO', telefono: '' },

      // Familia 3: González Pérez
      { familia_idx: 2, nombre: 'Patricia González Pérez', curp: 'GOPP721208MDFLRT09', edad: 52, genero: 'FEMENINO', fecha: '1972-12-08', rol: 'JEFE DE FAMILIA', telefono: '5534567890' },
      { familia_idx: 2, nombre: 'Sofía González Ramírez', curp: 'GORS990630MDFLMF05', edad: 25, genero: 'FEMENINO', fecha: '1999-06-30', rol: 'MIEMBRO', telefono: '5534567891' },

      // Familia 4: Rodríguez Sánchez
      { familia_idx: 3, nombre: 'Miguel Ángel Rodríguez Sánchez', curp: 'ROSM830805HDFDGN07', edad: 41, genero: 'MASCULINO', fecha: '1983-08-05', rol: 'JEFE DE FAMILIA', telefono: '5545678901' },
      { familia_idx: 3, nombre: 'Elena Sánchez López', curp: 'SALE850219MDFLPN04', edad: 39, genero: 'FEMENINO', fecha: '1985-02-19', rol: 'MIEMBRO', telefono: '5545678902' },
      { familia_idx: 3, nombre: 'Luis Miguel Rodríguez Sánchez', curp: 'ROSL091012HDFDGS06', edad: 15, genero: 'MASCULINO', fecha: '2009-10-12', rol: 'MIEMBRO', telefono: '' },
      { familia_idx: 3, nombre: 'Daniela Rodríguez Sánchez', curp: 'ROSD110328MDFDGN08', edad: 13, genero: 'FEMENINO', fecha: '2011-03-28', rol: 'MIEMBRO', telefono: '' },

      // Familia 5: Ramírez Torres
      { familia_idx: 4, nombre: 'José Ramírez Torres', curp: 'RATJ691120HDFRRS05', edad: 55, genero: 'MASCULINO', fecha: '1969-11-20', rol: 'JEFE DE FAMILIA', telefono: '5556789012' },
      { familia_idx: 4, nombre: 'Carmen Torres Vega', curp: 'TOVC710415MDFLRR07', edad: 53, genero: 'FEMENINO', fecha: '1971-04-15', rol: 'MIEMBRO', telefono: '5556789013' },

      // Familia 6: Flores Morales
      { familia_idx: 5, nombre: 'Andrea Flores Morales', curp: 'FOMA950708MDFLRN09', edad: 29, genero: 'FEMENINO', fecha: '1995-07-08', rol: 'JEFE DE FAMILIA', telefono: '3312345678' },

      // Familia 7: Castro Ruiz
      { familia_idx: 6, nombre: 'Fernando Castro Ruiz', curp: 'CARF760923HDFTRD05', edad: 48, genero: 'MASCULINO', fecha: '1976-09-23', rol: 'JEFE DE FAMILIA', telefono: '3323456789' },
      { familia_idx: 6, nombre: 'Gabriela Ruiz Mendoza', curp: 'RUMG790130MDFLZB08', edad: 45, genero: 'FEMENINO', fecha: '1979-01-30', rol: 'MIEMBRO', telefono: '3323456790' },

      // Familia 8: Mendoza Silva
      { familia_idx: 7, nombre: 'Alberto Mendoza Silva', curp: 'MESA911212HDFLLL07', edad: 33, genero: 'MASCULINO', fecha: '1991-12-12', rol: 'JEFE DE FAMILIA', telefono: '8112345678' },
      { familia_idx: 7, nombre: 'Mónica Silva Cortés', curp: 'SICM930525MDFLRN06', edad: 31, genero: 'FEMENINO', fecha: '1993-05-25', rol: 'MIEMBRO', telefono: '8112345679' }
    ];

    let personasInsertadas = 0;
    for (const persona of personas) {
      const nombreCifrado = await cryptoService.encrypt(persona.nombre);
      const curpCifrado = await cryptoService.encrypt(persona.curp);
      const telefonoCifrado = persona.telefono ? await cryptoService.encrypt(persona.telefono) : null;

      await writePool.query(
        `INSERT INTO personas (
          id_familia, nombre_encrypted, nombre_iv, nombre_tag,
          curp_encrypted, curp_iv, curp_tag,
          telefono_encrypted, telefono_iv, telefono_tag,
          edad, genero, fecha_nacimiento, rol_familia, activo, id_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          familyIds[persona.familia_idx],
          nombreCifrado.encrypted, nombreCifrado.iv, nombreCifrado.authTag,
          curpCifrado.encrypted, curpCifrado.iv, curpCifrado.authTag,
          telefonoCifrado?.encrypted || null,
          telefonoCifrado?.iv || null,
          telefonoCifrado?.authTag || null,
          persona.edad,
          persona.genero,
          persona.fecha,
          persona.rol,
          1,
          userId
        ]
      );
      personasInsertadas++;
    }
    console.log(`✅ ${personasInsertadas} personas insertadas (datos cifrados)\n`);

    // 7. Verificar datos insertados
    console.log('📊 Verificando datos insertados...\n');

    const [usuarios] = await writePool.query('SELECT COUNT(*) as total FROM usuarios WHERE email = ?', ['test@test.com']);
    const [estadosCount] = await writePool.query('SELECT COUNT(*) as total FROM estados');
    const [delegacionesCount] = await writePool.query('SELECT COUNT(*) as total FROM delegaciones');
    const [coloniasCount] = await writePool.query('SELECT COUNT(*) as total FROM colonias');
    const [familiasCount] = await writePool.query('SELECT COUNT(*) as total FROM familias');
    const [personasCount] = await writePool.query('SELECT COUNT(*) as total FROM personas');

    console.log('═══════════════════════════════════════');
    console.log('📈 RESUMEN DE DATOS INSERTADOS');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Usuarios:      ${usuarios[0].total}`);
    console.log(`✅ Estados:       ${estadosCount[0].total}`);
    console.log(`✅ Delegaciones:  ${delegacionesCount[0].total}`);
    console.log(`✅ Colonias:      ${coloniasCount[0].total}`);
    console.log(`✅ Familias:      ${familiasCount[0].total}`);
    console.log(`✅ Personas:      ${personasCount[0].total}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Seed completado exitosamente!\n');
    console.log('🔐 Credenciales de acceso:');
    console.log('   Email:    test@test.com');
    console.log('   Password: 123456\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seedDatabase();
