/**
 * Professional MongoDB Migration Script
 * Migrates data from JSON file to MongoDB with schema validation
 *
 * Usage: node scripts/migrate-to-mongodb.js [--force] [--validate-only]
 *
 * Options:
 *   --force         Drop existing collections before migration
 *   --validate-only Only validate data without importing
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'supremetuning';
const DATA_FILE = path.join(process.cwd(), 'data', 'supreme-tuning-master.json');

// Parse command line arguments
const args = process.argv.slice(2);
const FORCE_DROP = args.includes('--force');
const VALIDATE_ONLY = args.includes('--validate-only');

// Collection names
const COLLECTIONS = ['brands', 'models', 'types', 'engines', 'stages'];

/**
 * Validate data against business rules
 */
function validateData(collectionName, data) {
  const errors = [];
  const warnings = [];

  data.forEach((item, index) => {
    // Check required fields based on collection
    switch (collectionName) {
      case 'brands':
        if (!item.id) errors.push(`${collectionName}[${index}]: Missing required field 'id'`);
        if (!item.name) errors.push(`${collectionName}[${index}]: Missing required field 'name'`);
        if (typeof item.id !== 'number') errors.push(`${collectionName}[${index}]: 'id' must be a number`);
        break;

      case 'models':
        if (!item.id) errors.push(`${collectionName}[${index}]: Missing required field 'id'`);
        if (!item.brandId) errors.push(`${collectionName}[${index}]: Missing required field 'brandId'`);
        if (!item.name) errors.push(`${collectionName}[${index}]: Missing required field 'name'`);
        if (typeof item.id !== 'number') errors.push(`${collectionName}[${index}]: 'id' must be a number`);
        if (typeof item.brandId !== 'number') errors.push(`${collectionName}[${index}]: 'brandId' must be a number`);
        break;

      case 'types':
        if (!item.id) errors.push(`${collectionName}[${index}]: Missing required field 'id'`);
        if (!item.modelId) errors.push(`${collectionName}[${index}]: Missing required field 'modelId'`);
        if (!item.brandId) errors.push(`${collectionName}[${index}]: Missing required field 'brandId'`);
        if (!item.name) errors.push(`${collectionName}[${index}]: Missing required field 'name'`);
        if (typeof item.id !== 'number') errors.push(`${collectionName}[${index}]: 'id' must be a number`);
        if (typeof item.modelId !== 'number') errors.push(`${collectionName}[${index}]: 'modelId' must be a number`);
        if (typeof item.brandId !== 'number') errors.push(`${collectionName}[${index}]: 'brandId' must be a number`);
        break;

      case 'engines':
        if (!item.id) errors.push(`${collectionName}[${index}]: Missing required field 'id'`);
        if (!item.typeId) errors.push(`${collectionName}[${index}]: Missing required field 'typeId'`);
        if (!item.modelId) errors.push(`${collectionName}[${index}]: Missing required field 'modelId'`);
        if (!item.name) errors.push(`${collectionName}[${index}]: Missing required field 'name'`);
        if (!item.type) errors.push(`${collectionName}[${index}]: Missing required field 'type'`);
        if (item.type && !['petrol', 'diesel', 'hybrid', 'electric'].includes(item.type)) {
          errors.push(`${collectionName}[${index}]: Invalid engine type "${item.type}". Must be: petrol, diesel, hybrid, or electric`);
        }
        if (typeof item.id !== 'number') errors.push(`${collectionName}[${index}]: 'id' must be a number`);
        if (typeof item.typeId !== 'number') errors.push(`${collectionName}[${index}]: 'typeId' must be a number`);
        if (typeof item.modelId !== 'number') errors.push(`${collectionName}[${index}]: 'modelId' must be a number`);
        break;

      case 'stages':
        if (!item.id) errors.push(`${collectionName}[${index}]: Missing required field 'id'`);
        if (!item.engineId) errors.push(`${collectionName}[${index}]: Missing required field 'engineId'`);
        if (!item.stageName) errors.push(`${collectionName}[${index}]: Missing required field 'stageName'`);
        if (typeof item.id !== 'number') errors.push(`${collectionName}[${index}]: 'id' must be a number`);
        if (typeof item.engineId !== 'number') errors.push(`${collectionName}[${index}]: 'engineId' must be a number`);

        // Validate numeric fields
        if (item.stockHp !== null && item.stockHp !== undefined && item.stockHp < 0) {
          warnings.push(`${collectionName}[${index}]: 'stockHp' is negative`);
        }
        if (item.tunedHp !== null && item.tunedHp !== undefined && item.tunedHp < 0) {
          warnings.push(`${collectionName}[${index}]: 'tunedHp' is negative`);
        }
        break;
    }
  });

  return { errors, warnings };
}

/**
 * Create indexes for a collection
 */
async function createIndexes(db, collectionName) {
  const collection = db.collection(collectionName);

  try {
    switch (collectionName) {
      case 'brands':
        await collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
        await collection.createIndex({ name: 1 }, { name: 'name_index' });
        break;

      case 'models':
        await collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
        await collection.createIndex({ brandId: 1 }, { name: 'brandId_index' });
        await collection.createIndex({ name: 1 }, { name: 'name_index' });
        await collection.createIndex({ brandId: 1, name: 1 }, { name: 'brand_name_compound' });
        break;

      case 'types':
        await collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
        await collection.createIndex({ modelId: 1 }, { name: 'modelId_index' });
        await collection.createIndex({ brandId: 1 }, { name: 'brandId_index' });
        await collection.createIndex({ modelId: 1, name: 1 }, { name: 'model_name_compound' });
        break;

      case 'engines':
        await collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
        await collection.createIndex({ typeId: 1 }, { name: 'typeId_index' });
        await collection.createIndex({ modelId: 1 }, { name: 'modelId_index' });
        await collection.createIndex({ type: 1 }, { name: 'type_index' });
        await collection.createIndex({ typeId: 1, name: 1 }, { name: 'type_name_compound' });
        break;

      case 'stages':
        await collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
        await collection.createIndex({ engineId: 1 }, { name: 'engineId_index' });
        await collection.createIndex({ engineId: 1, stageName: 1 }, { name: 'engine_stage_compound' });
        break;
    }

    console.log(`   ✅ Created indexes for ${collectionName}`);
  } catch (error) {
    console.error(`   ❌ Failed to create indexes for ${collectionName}:`, error.message);
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting professional MongoDB migration...\n');

  if (FORCE_DROP) {
    console.log('⚠️  FORCE MODE: Existing collections will be dropped\n');
  }

  if (VALIDATE_ONLY) {
    console.log('🔍 VALIDATE ONLY MODE: No data will be imported\n');
  }

  // Step 1: Read and validate JSON file
  console.log('📖 Reading JSON file...');
  let jsonData;
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    jsonData = JSON.parse(fileContent);
    console.log(`✅ JSON file loaded successfully`);
    console.log(`   - Brands: ${jsonData.brands?.length || 0}`);
    console.log(`   - Models: ${jsonData.models?.length || 0}`);
    console.log(`   - Types: ${jsonData.types?.length || 0}`);
    console.log(`   - Engines: ${jsonData.engines?.length || 0}`);
    console.log(`   - Stages: ${jsonData.stages?.length || 0}\n`);
  } catch (error) {
    console.error('❌ Error reading JSON file:', error.message);
    process.exit(1);
  }

  // Step 2: Validate data
  console.log('🔍 Validating data...');
  let hasErrors = false;
  let totalWarnings = 0;

  for (const collectionName of COLLECTIONS) {
    const collectionData = jsonData[collectionName];
    if (!collectionData || !Array.isArray(collectionData)) {
      console.log(`   ⚠️  No data for ${collectionName}`);
      continue;
    }

    const { errors, warnings } = validateData(collectionName, collectionData);

    if (errors.length > 0) {
      hasErrors = true;
      console.log(`   ❌ ${collectionName}: ${errors.length} errors found`);
      errors.slice(0, 5).forEach(err => console.log(`      - ${err}`));
      if (errors.length > 5) {
        console.log(`      ... and ${errors.length - 5} more errors`);
      }
    } else {
      console.log(`   ✅ ${collectionName}: No errors`);
    }

    if (warnings.length > 0) {
      totalWarnings += warnings.length;
      console.log(`   ⚠️  ${collectionName}: ${warnings.length} warnings`);
      warnings.slice(0, 3).forEach(warn => console.log(`      - ${warn}`));
      if (warnings.length > 3) {
        console.log(`      ... and ${warnings.length - 3} more warnings`);
      }
    }
  }

  console.log('');

  if (hasErrors) {
    console.error('❌ Validation failed! Please fix errors before migrating.\n');
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log(`⚠️  Found ${totalWarnings} warnings (non-critical)\n`);
  }

  console.log('✅ Data validation passed!\n');

  if (VALIDATE_ONLY) {
    console.log('🎉 Validation complete (no data imported)\n');
    return;
  }

  // Step 3: Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    console.log('\n📝 Please add your MongoDB connection string to .env:');
    console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/supremetuning\n');
    process.exit(1);
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }

  const db = client.db(MONGODB_DB);

  try {
    // Step 4: Drop existing collections if force mode
    if (FORCE_DROP) {
      console.log('🗑️  Dropping existing collections...');
      for (const collName of COLLECTIONS) {
        try {
          await db.collection(collName).drop();
          console.log(`   ✅ Dropped collection: ${collName}`);
        } catch (err) {
          // Collection doesn't exist, that's fine
          console.log(`   ⚠️  Collection ${collName} doesn't exist (skipping)`);
        }
      }
      console.log('');
    }

    // Step 5: Create indexes
    console.log('📦 Creating indexes...');
    for (const collName of COLLECTIONS) {
      await createIndexes(db, collName);
    }
    console.log('');

    // Step 6: Insert data
    console.log('💾 Inserting data into MongoDB...');

    for (const collName of COLLECTIONS) {
      const collectionData = jsonData[collName];

      if (!collectionData || !Array.isArray(collectionData) || collectionData.length === 0) {
        console.log(`   ⚠️  No data to insert for ${collName}`);
        continue;
      }

      try {
        // Insert in batches to avoid memory issues
        const batchSize = 1000;
        let inserted = 0;

        for (let i = 0; i < collectionData.length; i += batchSize) {
          const batch = collectionData.slice(i, i + batchSize);
          await db.collection(collName).insertMany(batch, { ordered: false });
          inserted += batch.length;
        }

        console.log(`   ✅ Inserted ${inserted} documents into ${collName}`);
      } catch (error) {
        console.error(`   ❌ Failed to insert into ${collName}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed successfully!');

    // Step 7: Verify data
    console.log('\n📊 Verifying data...');
    for (const collName of COLLECTIONS) {
      const count = await db.collection(collName).countDocuments();
      console.log(`   - ${collName}: ${count} documents`);
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Restart your Next.js application');
    console.log('   2. Test the application to ensure everything works');
    console.log('   3. Use the new optimized API routes with direct MongoDB queries\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run migration
migrate().catch(console.error);

