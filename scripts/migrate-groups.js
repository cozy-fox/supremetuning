/**
 * Migration Script: Create Groups and Assign Models
 *
 * This script:
 * 1. Creates performance groups (RS, M, AMG) and Standard groups for Audi, BMW, Mercedes
 * 2. Updates models with the correct groupId based on naming patterns
 * 3. Adds branding info (descriptions, colors) for UI display
 *
 * Run with: node scripts/migrate-groups.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB URI
let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Remove quotes if present
uri = uri.trim().replace(/^["']|["']$/g, '');

const dbName = process.env.MONGODB_DB || 'supremetuning';

/**
 * Check if an Audi model is an RS/S performance model
 */
function isAudiRSModel(model) {
  const name = (model.name || model).toString().toUpperCase();
  // RS models: RS3, RS4, RS5, RS6, RS7, RS Q3, RS Q8, RSQ3, RSQ8, TT RS, etc.
  if (/^RS[0-9\s]/.test(name) || /^RSQ[0-9]/.test(name)) return true;
  // S models: S3, S4, S5, S6, S7, S8, SQ5, SQ7, SQ8, TTS, etc.
  if (/^S[0-9]/.test(name) || /^SQ[0-9]/.test(name)) return true;
  // TT RS or TTS
  if (name === 'TT RS' || name === 'TTS') return true;
  // Models with RS in the name (e.g., "Q3 RS")
  if (name.includes(' RS')) return true;
  return false;
}

/**
 * Check if a BMW model is an M performance model
 */
function isBMWMModel(model) {
  const name = (model.name || model).toString().toUpperCase();
  // M models: M2, M3, M4, M5, M6, M8
  if (/^M[0-9]/.test(name)) return true;
  // X models with M suffix (X3 M, X4 M, X5 M, X6 M)
  if (/^X[0-9]\s*M/.test(name)) return true;
  // XM
  if (name === 'XM') return true;
  // 1M Coupé
  if (name.startsWith('1M')) return true;
  return false;
}

/**
 * Check if a Mercedes model is an AMG performance model
 */
function isMercedesAMGModel(model) {
  const name = (model.name || model).toString().toUpperCase();
  return name.includes('AMG');
}

/**
 * Get the next available ID for a collection
 */
async function getNextId(collection) {
  const maxDoc = await collection.find().sort({ id: -1 }).limit(1).toArray();
  return maxDoc.length > 0 ? maxDoc[0].id + 1 : 1;
}

async function migrate() {
  console.log('🚀 Starting Group Migration...\n');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const brandsCol = db.collection('brands');
    const groupsCol = db.collection('groups');
    const modelsCol = db.collection('models');
    
    // Get all brands
    const brands = await brandsCol.find().toArray();
    console.log(`📊 Found ${brands.length} brands\n`);
    
    // Find Audi, BMW, Mercedes
    const audi = brands.find(b => b.name.toLowerCase() === 'audi');
    const bmw = brands.find(b => b.name.toLowerCase() === 'bmw');
    const mercedes = brands.find(b => b.name.toLowerCase().includes('mercedes'));
    
    console.log('🔍 Target brands:');
    if (audi) console.log(`   - Audi (ID: ${audi.id})`);
    if (bmw) console.log(`   - BMW (ID: ${bmw.id})`);
    if (mercedes) console.log(`   - Mercedes (ID: ${mercedes.id})`);
    console.log('');
    
    // Get next group ID
    let nextGroupId = await getNextId(groupsCol);
    console.log(`📊 Starting group ID: ${nextGroupId}\n`);
    
    // Define groups to create
    const groupsToCreate = [];

    // Create groups for Audi (RS + Standard)
    if (audi) {
      groupsToCreate.push(
        { brandId: audi.id, name: 'RS', isPerformance: true, order: 0, filter: (m) => isAudiRSModel(m) },
        { brandId: audi.id, name: 'Standard', isPerformance: false, order: 1, filter: (m) => !isAudiRSModel(m) }
      );
    }

    // Create groups for BMW (M + Standard)
    if (bmw) {
      groupsToCreate.push(
        { brandId: bmw.id, name: 'M', isPerformance: true, order: 0, filter: (m) => isBMWMModel(m) },
        { brandId: bmw.id, name: 'Standard', isPerformance: false, order: 1, filter: (m) => !isBMWMModel(m) }
      );
    }

    // Create groups for Mercedes (AMG + Standard)
    if (mercedes) {
      groupsToCreate.push(
        { brandId: mercedes.id, name: 'AMG', isPerformance: true, order: 0, filter: (m) => isMercedesAMGModel(m) },
        { brandId: mercedes.id, name: 'Standard', isPerformance: false, order: 1, filter: (m) => !isMercedesAMGModel(m) }
      );
    }

    // Create Standard group for ALL OTHER brands (no group selector will show for these)
    const performanceBrandIds = [audi?.id, bmw?.id, mercedes?.id].filter(Boolean);
    const otherBrands = brands.filter(b => !performanceBrandIds.includes(b.id));

    for (const brand of otherBrands) {
      groupsToCreate.push(
        { brandId: brand.id, name: 'Standard', isPerformance: false, order: 0, filter: () => true }
      );
    }
    
    // Create groups and track their IDs
    const createdGroups = [];
    
    for (const groupDef of groupsToCreate) {
      // Check if group already exists
      const existing = await groupsCol.findOne({ 
        brandId: groupDef.brandId, 
        name: groupDef.name 
      });
      
      if (existing) {
        console.log(`⏭️  Group "${groupDef.name}" already exists for brand ID ${groupDef.brandId}`);
        createdGroups.push({ ...existing, filter: groupDef.filter });
        continue;
      }
      
      const group = {
        id: nextGroupId++,
        brandId: groupDef.brandId,
        name: groupDef.name,
        slug: groupDef.name.toLowerCase().replace(/\s+/g, '-'),
        isPerformance: groupDef.isPerformance,
        logo: null,
        order: groupDef.order
      };
      
      await groupsCol.insertOne(group);
      console.log(`✅ Created group: ${groupDef.name} (ID: ${group.id}) for brand ID ${groupDef.brandId}`);
      createdGroups.push({ ...group, filter: groupDef.filter });
    }
    
    console.log(`\n📊 Total groups: ${createdGroups.length}\n`);

    // Now update models with groupId
    console.log('🔄 Updating models with groupId...\n');

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const group of createdGroups) {
      // Get all models for this brand
      const models = await modelsCol.find({ brandId: group.brandId }).toArray();

      // Filter models that belong to this group
      const matchingModels = models.filter(m => group.filter(m));

      console.log(`📁 Group "${group.name}" (Brand ID: ${group.brandId}): ${matchingModels.length} models`);

      for (const model of matchingModels) {
        // Check if already has correct groupId
        if (model.groupId === group.id) {
          totalSkipped++;
          continue;
        }

        // Update model with groupId
        await modelsCol.updateOne(
          { id: model.id },
          { $set: { groupId: group.id } }
        );

        console.log(`   ✅ ${model.name} → groupId: ${group.id}`);
        totalUpdated++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   - Models updated: ${totalUpdated}`);
    console.log(`   - Models skipped (already correct): ${totalSkipped}`);
    console.log(`   - Groups created/verified: ${createdGroups.length}`);

    // Verify the migration
    console.log('\n🔍 Verification:\n');

    for (const group of createdGroups) {
      const count = await modelsCol.countDocuments({ groupId: group.id });
      console.log(`   ${group.name} (ID: ${group.id}): ${count} models`);
    }

    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrate();

