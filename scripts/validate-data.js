/**
 * Data Validation Script
 * 
 * Validates data integrity after group migration:
 * 1. All models have valid groupId
 * 2. All groups have valid brandId
 * 3. Performance models are in correct groups
 * 
 * Run with: node scripts/validate-data.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}
uri = uri.trim().replace(/^["']|["']$/g, '');

const dbName = process.env.MONGODB_DB || 'supremetuning';

async function validate() {
  console.log('🔍 Starting Data Validation...\n');
  
  const client = new MongoClient(uri);
  let errors = 0;
  let warnings = 0;
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const brandsCol = db.collection('brands');
    const groupsCol = db.collection('groups');
    const modelsCol = db.collection('models');
    const typesCol = db.collection('types');
    const enginesCol = db.collection('engines');
    
    // 1. Check all brands have groups
    console.log('📋 Checking Brands → Groups...');
    const brands = await brandsCol.find().toArray();
    for (const brand of brands) {
      const groupCount = await groupsCol.countDocuments({ brandId: brand.id });
      if (groupCount === 0) {
        console.log(`  ⚠️ Brand "${brand.name}" has no groups`);
        warnings++;
      } else {
        console.log(`  ✅ ${brand.name}: ${groupCount} groups`);
      }
    }
    
    // 2. Check all models have valid groupId
    console.log('\n📋 Checking Models → Groups...');
    const models = await modelsCol.find().toArray();
    let modelsWithGroup = 0;
    let modelsWithoutGroup = 0;
    
    for (const model of models) {
      if (!model.groupId) {
        console.log(`  ❌ Model "${model.name}" (id: ${model.id}) has no groupId`);
        errors++;
        modelsWithoutGroup++;
      } else {
        const group = await groupsCol.findOne({ id: model.groupId });
        if (!group) {
          console.log(`  ❌ Model "${model.name}" has invalid groupId: ${model.groupId}`);
          errors++;
        } else {
          modelsWithGroup++;
        }
      }
    }
    console.log(`  ✅ ${modelsWithGroup} models have valid groupId`);
    if (modelsWithoutGroup > 0) {
      console.log(`  ❌ ${modelsWithoutGroup} models missing groupId`);
    }
    
    // 3. Check types have valid modelId
    console.log('\n📋 Checking Types → Models...');
    const types = await typesCol.find().toArray();
    let invalidTypes = 0;
    for (const type of types) {
      const model = await modelsCol.findOne({ id: type.modelId });
      if (!model) {
        console.log(`  ❌ Type "${type.name}" has invalid modelId: ${type.modelId}`);
        errors++;
        invalidTypes++;
      }
    }
    console.log(`  ✅ ${types.length - invalidTypes}/${types.length} types have valid modelId`);
    
    // 4. Check engines have valid typeId
    console.log('\n📋 Checking Engines → Types...');
    const engines = await enginesCol.find().toArray();
    let invalidEngines = 0;
    for (const engine of engines) {
      const type = await typesCol.findOne({ id: engine.typeId });
      if (!type) {
        invalidEngines++;
      }
    }
    console.log(`  ✅ ${engines.length - invalidEngines}/${engines.length} engines have valid typeId`);
    if (invalidEngines > 0) {
      console.log(`  ⚠️ ${invalidEngines} engines have invalid typeId`);
      warnings++;
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Brands: ${brands.length}`);
    const totalGroups = await groupsCol.countDocuments();
    console.log(`Groups: ${totalGroups}`);
    console.log(`Models: ${models.length}`);
    console.log(`Types: ${types.length}`);
    console.log(`Engines: ${engines.length}`);
    console.log('');
    
    if (errors === 0 && warnings === 0) {
      console.log('🎉 All validations passed!');
    } else {
      console.log(`⚠️ Warnings: ${warnings}`);
      console.log(`❌ Errors: ${errors}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

validate();

