/**
 * ============================================
 * MIGRATION SCRIPT: Ultra-Secure Database
 * Drops existing DB and creates new encrypted schema
 * ============================================
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 Starting database migration to ultra-secure schema...\n');

  // Create connection without database selection
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'database_schema_encrypted.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema file loaded successfully');
    console.log('⚠️  WARNING: This will DROP the existing database!\n');

    // Execute the schema
    console.log('🗑️  Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS dbserverine');

    console.log('🏗️  Creating new database...');
    await connection.query('CREATE DATABASE dbserverine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

    console.log('🔄 Switching to new database...');
    await connection.query('USE dbserverine');

    // Remove comments and split by CREATE TABLE
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Extract all CREATE TABLE statements
    const tableMatches = cleanSchema.match(/CREATE TABLE[\s\S]*?ENGINE=InnoDB[^;]*;/g);

    if (tableMatches) {
      console.log(`\n📊 Creating ${tableMatches.length} tables...\n`);

      for (const tableStmt of tableMatches) {
        const tableName = tableStmt.match(/CREATE TABLE (\w+)/)?.[1];
        console.log(`  ✅ Creating table: ${tableName}`);
        await connection.query(tableStmt);
      }
    }

    // Execute SET GLOBAL statements
    const setStatements = cleanSchema.match(/SET GLOBAL[^;]+;/g);
    if (setStatements) {
      for (const setStmt of setStatements) {
        try {
          await connection.query(setStmt);
        } catch (err) {
          console.log(`  ⚠️  Skipping: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!\n');
    console.log('📋 Created tables:');
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(row => {
      console.log(`   - ${Object.values(row)[0]}`);
    });

    console.log('\n🎯 Next step: Run seed script to populate with encrypted data');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
