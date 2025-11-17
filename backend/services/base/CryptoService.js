const crypto = require('crypto');
require('dotenv').config();

/**
 * ============================================
 * SISTEMA DE CIFRADO DE 5 CAPAS
 * Seguridad Máxima para Datos Sensibles
 * ============================================
 *
 * CAPA 1: AES-256-GCM (Principal) - Autenticación integrada
 * CAPA 2: AES-256-CBC (Secundaria) - Estándar de la industria
 * CAPA 3: ChaCha20 (Alta velocidad) - Resistente a ataques de canal lateral
 * CAPA 4: Camellia-256-CBC (Redundancia) - Alternativa a AES
 * CAPA 5: XOR con salt rotativo - Ofuscación adicional
 *
 * El texto plano pasa por las 5 capas en orden,
 * generando un texto cifrado altamente seguro.
 */

class CryptoService {
  constructor() {
    // Validar que existan las claves de cifrado
    this.validateKeys();

    // Configurar claves de cada capa
    this.keys = {
      layer1: Buffer.from(process.env.ENCRYPTION_KEY_LAYER1 || this.generateKey(), 'hex'),
      layer2: Buffer.from(process.env.ENCRYPTION_KEY_LAYER2 || this.generateKey(), 'hex'),
      layer3: Buffer.from(process.env.ENCRYPTION_KEY_LAYER3 || this.generateKey(), 'hex'),
      layer4: Buffer.from(process.env.ENCRYPTION_KEY_LAYER4 || this.generateKey(), 'hex'),
      layer5: Buffer.from(process.env.ENCRYPTION_KEY_LAYER5 || this.generateKey(), 'hex'),
    };

    this.salt = process.env.ENCRYPTION_SALT || this.generateSalt();

    // Configuración de algoritmos
    this.algorithms = {
      layer1: 'aes-256-gcm',
      layer2: 'aes-256-cbc',
      layer3: 'chacha20',
      layer4: 'camellia-256-cbc',
    };

    this.ivLength = 16; // 128 bits
    this.authTagLength = 16; // 128 bits
  }

  /**
   * Validar que existan las claves de cifrado
   */
  validateKeys() {
    const requiredKeys = [
      'ENCRYPTION_KEY_LAYER1',
      'ENCRYPTION_KEY_LAYER2',
      'ENCRYPTION_KEY_LAYER3',
      'ENCRYPTION_KEY_LAYER4',
      'ENCRYPTION_KEY_LAYER5',
    ];

    const missingKeys = requiredKeys.filter(key => !process.env[key]);

    if (missingKeys.length > 0 && process.env.NODE_ENV === 'production') {
      console.error('❌ Missing encryption keys:', missingKeys.join(', '));
      throw new Error('Missing encryption keys in production environment');
    }

    if (missingKeys.length > 0) {
      console.warn('⚠️ Using auto-generated keys (NOT SECURE FOR PRODUCTION)');
    }
  }

  /**
   * Generar clave aleatoria (solo para desarrollo)
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar salt aleatorio (solo para desarrollo)
   */
  generateSalt() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * ============================================
   * CIFRADO COMPLETO (5 CAPAS)
   * ============================================
   */
  async encrypt(plainText) {
    try {
      if (!plainText) {
        throw new Error('Plain text is required');
      }

      // Convertir a string si es necesario
      const text = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);

      // CAPA 5: XOR con salt rotativo (primera capa de ofuscación)
      let encrypted = this.encryptXOR(text);

      // CAPA 4: Camellia-256-CBC
      const layer4Result = this.encryptLayer(encrypted, 'layer4');
      encrypted = layer4Result.encrypted;

      // CAPA 3: ChaCha20
      const layer3Result = this.encryptLayer(encrypted, 'layer3');
      encrypted = layer3Result.encrypted;

      // CAPA 2: AES-256-CBC
      const layer2Result = this.encryptLayer(encrypted, 'layer2');
      encrypted = layer2Result.encrypted;

      // CAPA 1: AES-256-GCM (con autenticación)
      const layer1Result = this.encryptLayerGCM(encrypted);

      // Retornar el texto cifrado y metadata
      return {
        encrypted: layer1Result.encrypted,
        iv: layer1Result.iv,
        authTag: layer1Result.authTag,
        metadata: {
          algorithm: 'multi-layer-5',
          version: '2.0',
          layers: 5,
        },
      };
    } catch (error) {
      console.error('❌ Encryption error:', error.message);
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  /**
   * ============================================
   * DESCIFRADO COMPLETO (5 CAPAS)
   * ============================================
   */
  async decrypt(encryptedData) {
    try {
      if (!encryptedData || !encryptedData.encrypted) {
        throw new Error('Encrypted data is required');
      }

      const { encrypted, iv, authTag } = encryptedData;

      // CAPA 1: AES-256-GCM (descifrar con autenticación)
      let decrypted = this.decryptLayerGCM(encrypted, iv, authTag);

      // CAPA 2: AES-256-CBC
      decrypted = this.decryptLayer(decrypted, 'layer2');

      // CAPA 3: ChaCha20
      decrypted = this.decryptLayer(decrypted, 'layer3');

      // CAPA 4: Camellia-256-CBC
      decrypted = this.decryptLayer(decrypted, 'layer4');

      // CAPA 5: XOR (quitar ofuscación)
      decrypted = this.decryptXOR(decrypted);

      return decrypted;
    } catch (error) {
      console.error('❌ Decryption error:', error.message);
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  /**
   * ============================================
   * CAPA 1: AES-256-GCM (CON AUTENTICACIÓN)
   * ============================================
   */
  encryptLayerGCM(plainText) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithms.layer1, this.keys.layer1, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decryptLayerGCM(encryptedText, ivHex, authTagHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithms.layer1, this.keys.layer1, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * ============================================
   * CAPAS 2, 3, 4: AES/ChaCha/Camellia
   * ============================================
   */
  encryptLayer(plainText, layer) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithms[layer], this.keys[layer], iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Concatenar IV con texto cifrado
    return {
      encrypted: iv.toString('hex') + ':' + encrypted,
    };
  }

  decryptLayer(encryptedText, layer) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithms[layer], this.keys[layer], iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * ============================================
   * CAPA 5: XOR CON SALT ROTATIVO
   * ============================================
   */
  encryptXOR(text) {
    const textBuffer = Buffer.from(text, 'utf8');
    const keyBuffer = Buffer.from(this.salt, 'utf8');
    const encrypted = Buffer.alloc(textBuffer.length);

    for (let i = 0; i < textBuffer.length; i++) {
      encrypted[i] = textBuffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return encrypted.toString('base64');
  }

  decryptXOR(encryptedText) {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const keyBuffer = Buffer.from(this.salt, 'utf8');
    const decrypted = Buffer.alloc(encryptedBuffer.length);

    for (let i = 0; i < encryptedBuffer.length; i++) {
      decrypted[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return decrypted.toString('utf8');
  }

  /**
   * ============================================
   * FUNCIONES DE UTILIDAD
   * ============================================
   */

  /**
   * Hash seguro (para contraseñas, etc.)
   */
  hash(text, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(text).digest('hex');
  }

  /**
   * Generar token aleatorio
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generar UUID
   */
  generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Comparar hash de forma segura (timing attack resistant)
   */
  secureCompare(a, b) {
    try {
      const bufferA = Buffer.from(a, 'utf8');
      const bufferB = Buffer.from(b, 'utf8');

      if (bufferA.length !== bufferB.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  }

  /**
   * ============================================
   * CIFRADO PARA BASE DE DATOS
   * ============================================
   * Retorna objeto compatible con campos de BD
   */
  async encryptForDB(plainText, fieldName = 'field') {
    const result = await this.encrypt(plainText);

    return {
      [`${fieldName}_encrypted`]: result.encrypted,
      [`${fieldName}_iv`]: result.iv,
      [`${fieldName}_tag`]: result.authTag,
    };
  }

  /**
   * Descifrar desde base de datos
   */
  async decryptFromDB(dbRecord, fieldName = 'field') {
    if (!dbRecord) {
      return null;
    }

    const encryptedField = `${fieldName}_encrypted`;
    const ivField = `${fieldName}_iv`;
    const tagField = `${fieldName}_tag`;

    if (!dbRecord[encryptedField] || !dbRecord[ivField] || !dbRecord[tagField]) {
      throw new Error(`Missing encryption fields for ${fieldName}`);
    }

    return await this.decrypt({
      encrypted: dbRecord[encryptedField],
      iv: dbRecord[ivField],
      authTag: dbRecord[tagField],
    });
  }

  /**
   * Cifrar múltiples campos de un objeto
   */
  async encryptObject(obj, fieldsToEncrypt) {
    const encrypted = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (obj[field]) {
        const result = await this.encrypt(obj[field]);
        encrypted[`${field}_encrypted`] = result.encrypted;
        encrypted[`${field}_iv`] = result.iv;
        encrypted[`${field}_tag`] = result.authTag;
        delete encrypted[field]; // Eliminar campo sin cifrar
      }
    }

    return encrypted;
  }

  /**
   * Descifrar múltiples campos de un objeto
   */
  async decryptObject(obj, fieldsToDecrypt) {
    const decrypted = { ...obj };

    for (const field of fieldsToDecrypt) {
      const encryptedField = `${field}_encrypted`;
      const ivField = `${field}_iv`;
      const tagField = `${field}_tag`;

      if (obj[encryptedField] && obj[ivField] && obj[tagField]) {
        decrypted[field] = await this.decrypt({
          encrypted: obj[encryptedField],
          iv: obj[ivField],
          authTag: obj[tagField],
        });

        // Opcionalmente eliminar campos cifrados
        delete decrypted[encryptedField];
        delete decrypted[ivField];
        delete decrypted[tagField];
      }
    }

    return decrypted;
  }

  /**
   * ============================================
   * DIAGNÓSTICO Y TESTING
   * ============================================
   */
  async testEncryption() {
    const testData = 'Test data for encryption - CONFIDENCIAL';

    try {
      console.log('🔐 Testing 5-layer encryption...');

      const encrypted = await this.encrypt(testData);
      console.log('✅ Encryption successful');
      console.log('   Encrypted:', encrypted.encrypted.substring(0, 50) + '...');
      console.log('   IV:', encrypted.iv);
      console.log('   Auth Tag:', encrypted.authTag);

      const decrypted = await this.decrypt(encrypted);
      console.log('✅ Decryption successful');
      console.log('   Decrypted:', decrypted);

      const isValid = decrypted === testData;
      console.log(isValid ? '✅ Encryption test PASSED' : '❌ Encryption test FAILED');

      return isValid;
    } catch (error) {
      console.error('❌ Encryption test FAILED:', error.message);
      return false;
    }
  }

  /**
   * Obtener información del servicio
   */
  getInfo() {
    return {
      layers: 5,
      algorithms: [
        'XOR with rotative salt',
        'Camellia-256-CBC',
        'ChaCha20',
        'AES-256-CBC',
        'AES-256-GCM with authentication',
      ],
      ivLength: this.ivLength,
      authTagLength: this.authTagLength,
      version: '2.0',
    };
  }
}

// Singleton
const cryptoService = new CryptoService();

module.exports = cryptoService;
