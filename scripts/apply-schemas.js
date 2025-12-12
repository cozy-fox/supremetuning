/**
 * Apply MongoDB Schemas and Indexes to Existing Database
 * 
 * This script applies schema validation and creates indexes on existing collections
 * without migrating data (data should already be in MongoDB)
 * 
 * Usage: node scripts/apply-schemas.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'supremetuning';

// Collection names
const COLLECTIONS = ['brands', 'models', 'types', 'engines', 'stages', 'backups', 'metadata'];

/**
 * Schema definitions (inline for CommonJS compatibility)
 */
const schemas = {
  brands: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'name'],
        properties: {
          id: { bsonType: 'int', description: 'Unique brand identifier' },
          name: { bsonType: 'string', minLength: 1, maxLength: 100 },
          slug: { bsonType: 'string' }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  },
  
  models: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'brandId', 'name'],
        properties: {
          id: { bsonType: 'int' },
          brandId: { bsonType: 'int' },
          name: { bsonType: 'string', minLength: 1, maxLength: 100 },
          slug: { bsonType: 'string' }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  },
  
  types: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'modelId', 'brandId', 'name'],
        properties: {
          id: { bsonType: 'int' },
          modelId: { bsonType: 'int' },
          brandId: { bsonType: 'int' },
          brandName: { bsonType: 'string' },
          modelName: { bsonType: 'string' },
          name: { bsonType: 'string', minLength: 1, maxLength: 200 },
          slug: { bsonType: 'string' }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  },
  
  engines: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'typeId', 'modelId', 'name', 'type'],
        properties: {
          id: { bsonType: 'int' },
          typeId: { bsonType: 'int' },
          modelId: { bsonType: 'int' },
          code: { bsonType: 'string' },
          name: { bsonType: 'string', minLength: 1, maxLength: 200 },
          startYear: { bsonType: 'string' },
          endYear: { bsonType: 'string' },
          type: { bsonType: 'string', enum: ['petrol', 'diesel', 'hybrid', 'electric'] },
          power: { bsonType: 'int', minimum: 0 },
          slug: { bsonType: 'string' }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  },
  
  stages: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'engineId', 'stageName'],
        properties: {
          id: { bsonType: 'int' },
          engineId: { bsonType: 'int' },
          stageName: { bsonType: 'string', minLength: 1, maxLength: 100 },
          stockHp: { bsonType: ['int', 'null'], minimum: 0 },
          stockNm: { bsonType: ['int', 'null'], minimum: 0 },
          tunedHp: { bsonType: ['int', 'null'], minimum: 0 },
          tunedNm: { bsonType: ['int', 'null'], minimum: 0 },
          gainHp: { bsonType: ['int', 'null'] },
          gainNm: { bsonType: ['int', 'null'] },
          price: { bsonType: ['int', 'null'], minimum: 0 },
          currency: { bsonType: 'string', enum: ['EUR', 'USD', 'GBP'] },
          hardwareMods: { bsonType: 'array', items: { bsonType: 'string' } },
          ecuUnlock: { bsonType: ['bool', 'null'] },
          cpcUpgrade: { bsonType: ['bool', 'null'] },
          gearboxLimitNm: { bsonType: ['int', 'null'] },
          recommendedGearboxTune: { bsonType: 'bool' },
          notes: { bsonType: 'string' }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  }
};

/**
 * Index definitions
 */
const indexes = {
  brands: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { name: 1 }, options: { name: 'name_index' } }
  ],
  models: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { name: 1 }, options: { name: 'name_index' } },
    { key: { brandId: 1, name: 1 }, options: { name: 'brand_name_compound' } }
  ],
  types: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { modelId: 1 }, options: { name: 'modelId_index' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { modelId: 1, name: 1 }, options: { name: 'model_name_compound' } }
  ],
  engines: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { typeId: 1 }, options: { name: 'typeId_index' } },
    { key: { modelId: 1 }, options: { name: 'modelId_index' } },
    { key: { type: 1 }, options: { name: 'type_index' } },
    { key: { typeId: 1, name: 1 }, options: { name: 'type_name_compound' } }
  ],
  stages: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { engineId: 1 }, options: { name: 'engineId_index' } },
    { key: { engineId: 1, stageName: 1 }, options: { name: 'engine_stage_compound' } }
  ],
  backups: [
    { key: { timestamp: -1 }, options: { name: 'timestamp_desc' } }
  ],
  metadata: [
    { key: { key: 1 }, options: { unique: true, name: 'key_unique' } }
  ]
};

/**
 * Apply schema validation to a collection
 */
async function applySchema(db, collectionName) {
  const schema = schemas[collectionName];
  if (!schema) {
    console.log(`   ⚠️  No schema defined for ${collectionName}`);
    return;
  }

  try {
    await db.command({
      collMod: collectionName,
      validator: schema.validator,
      validationLevel: schema.validationLevel,
      validationAction: schema.validationAction
    });
    console.log(`   ✅ Applied schema validation to ${collectionName}`);
  } catch (error) {
    console.error(`   ❌ Failed to apply schema to ${collectionName}:`, error.message);
  }
}

/**
 * Create indexes for a collection
 */
async function createIndexes(db, collectionName) {
  const collectionIndexes = indexes[collectionName];
  if (!collectionIndexes) {
    console.log(`   ⚠️  No indexes defined for ${collectionName}`);
    return;
  }

  const collection = db.collection(collectionName);
  let created = 0;
  let updated = 0;

  for (const indexDef of collectionIndexes) {
    try {
      await collection.createIndex(indexDef.key, indexDef.options);
      created++;
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        // Index exists with different options, drop and recreate
        try {
          await collection.dropIndex(indexDef.options.name);
          await collection.createIndex(indexDef.key, indexDef.options);
          updated++;
        } catch (dropError) {
          console.error(`   ❌ Failed to update index ${indexDef.options.name}:`, dropError.message);
        }
      } else {
        console.error(`   ❌ Failed to create index ${indexDef.options.name}:`, error.message);
      }
    }
  }

  console.log(`   ✅ ${collectionName}: ${created} indexes created, ${updated} updated`);
}

/**
 * Main function
 */
async function applySchemas() {
  console.log('🚀 Applying MongoDB schemas and indexes...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  let client;
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DB_NAME);

    // Apply schemas
    console.log('📋 Applying schema validation...');
    for (const collName of COLLECTIONS) {
      await applySchema(db, collName);
    }
    console.log('');

    // Create indexes
    console.log('📦 Creating indexes...');
    for (const collName of COLLECTIONS) {
      await createIndexes(db, collName);
    }
    console.log('');

    // Verify
    console.log('📊 Verification:');
    for (const collName of COLLECTIONS) {
      const collection = db.collection(collName);
      const count = await collection.countDocuments();
      const indexList = await collection.indexes();
      console.log(`   - ${collName}: ${count} documents, ${indexList.length} indexes`);
    }

    console.log('\n🎉 Schemas and indexes applied successfully!');
    console.log('\n📝 Note: Validation is set to "moderate" level with "warn" action');
    console.log('   This means invalid documents will be logged but not rejected.');
    console.log('   Change to "strict" and "error" in production if needed.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
applySchemas().catch(console.error);


