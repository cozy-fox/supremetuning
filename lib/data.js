/**
 * Data Service for Next.js - MongoDB Implementation
 * Replaces file-based storage with MongoDB Atlas
 */
import { getCollection } from './mongodb';

// Collection names
const COLLECTIONS = {
  brands: 'brands',
  models: 'models',
  types: 'types',
  engines: 'engines',
  stages: 'stages',
  backups: 'backups',
  metadata: 'metadata'
};

/**
 * Initialize MongoDB collections with indexes
 */
export async function initDataLayer() {
  try {
    // Create indexes for better query performance
    const brandsCol = await getCollection(COLLECTIONS.brands);
    await brandsCol.createIndex({ id: 1 }, { unique: true });
    await brandsCol.createIndex({ name: 1 });

    const modelsCol = await getCollection(COLLECTIONS.models);
    await modelsCol.createIndex({ id: 1 }, { unique: true });
    await modelsCol.createIndex({ brandId: 1 });

    const typesCol = await getCollection(COLLECTIONS.types);
    await typesCol.createIndex({ id: 1 }, { unique: true });
    await typesCol.createIndex({ modelId: 1 });
    await typesCol.createIndex({ brandId: 1 });

    const enginesCol = await getCollection(COLLECTIONS.engines);
    await enginesCol.createIndex({ id: 1 }, { unique: true });
    await enginesCol.createIndex({ typeId: 1 });
    await enginesCol.createIndex({ modelId: 1 });

    const stagesCol = await getCollection(COLLECTIONS.stages);
    await stagesCol.createIndex({ id: 1 }, { unique: true });
    await stagesCol.createIndex({ engineId: 1 });

    const backupsCol = await getCollection(COLLECTIONS.backups);
    await backupsCol.createIndex({ timestamp: -1 });

    console.log('📦 MongoDB indexes created successfully');

    // Check if data exists
    const brandCount = await brandsCol.countDocuments();
    console.log(`📦 MongoDB connected: ${brandCount} brands found`);

    return true;
  } catch (error) {
    console.error('❌ MongoDB initialization error:', error);
    throw error;
  }
}

/**
 * Get next available ID for a collection
 */
export async function getNextId(collectionName) {
  const collection = await getCollection(collectionName);
  const lastItem = await collection.findOne({}, { sort: { id: -1 }, projection: { id: 1 } });
  return lastItem ? lastItem.id + 1 : 1;
}

/**
 * Find a single document by ID
 */
export async function findById(collectionName, id) {
  try {
    const collection = await getCollection(collectionName);
    const doc = await collection.findOne({ id: parseInt(id) });
    if (!doc) return null;

    // Remove MongoDB _id field
    const { _id, ...rest } = doc;
    return rest;
  } catch (error) {
    console.error(`❌ findById error (${collectionName}, ${id}):`, error);
    return null;
  }
}

/**
 * Find documents by field value
 */
export async function findBy(collectionName, fieldOrQuery, value, options = {}) {
  try {
    const collection = await getCollection(collectionName);

    // Handle both object queries and field/value pairs
    let query;
    if (typeof fieldOrQuery === 'object' && fieldOrQuery !== null) {
      query = fieldOrQuery;
    } else if (fieldOrQuery && value !== undefined) {
      query = { [fieldOrQuery]: typeof value === 'number' ? value : value };
    } else {
      query = {};
    }

    let cursor = collection.find(query);

    // Apply sorting
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    } else {
      // Default sort by name for most collections
      cursor = cursor.sort({ name: 1 });
    }

    // Apply limit
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    const docs = await cursor.toArray();

    // Remove MongoDB _id field
    return docs.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error(`❌ findBy error (${collectionName}):`, error);
    return [];
  }
}

/**
 * Update a single document by ID
 */
export async function updateById(collectionName, id, updateData) {
  try {
    const collection = await getCollection(collectionName);

    // Remove _id and id from update data to prevent modification
    const { _id, id: _, ...safeUpdateData } = updateData;

    const result = await collection.updateOne(
      { id: parseInt(id) },
      { $set: safeUpdateData }
    );

    if (result.matchedCount === 0) {
      throw new Error(`Document with id ${id} not found in ${collectionName}`);
    }

    console.log(`✅ Updated ${collectionName} id=${id}`);
    return true;
  } catch (error) {
    console.error(`❌ updateById error (${collectionName}, ${id}):`, error);
    throw error;
  }
}

/**
 * Delete a single document by ID
 */
export async function deleteById(collectionName, id) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      throw new Error(`Document with id ${id} not found in ${collectionName}`);
    }

    console.log(`✅ Deleted ${collectionName} id=${id}`);
    return true;
  } catch (error) {
    console.error(`❌ deleteById error (${collectionName}, ${id}):`, error);
    throw error;
  }
}

/**
 * Insert a new document
 */
export async function insertOne(collectionName, data) {
  try {
    const collection = await getCollection(collectionName);

    // Auto-generate ID if not provided
    if (!data.id) {
      data.id = await getNextId(collectionName);
    }

    const result = await collection.insertOne(data);
    console.log(`✅ Inserted into ${collectionName} id=${data.id}`);

    return { ...data, _id: result.insertedId };
  } catch (error) {
    console.error(`❌ insertOne error (${collectionName}):`, error);
    throw error;
  }
}

/**
 * Count documents matching a query
 */
export async function countDocuments(collectionName, query = {}) {
  try {
    const collection = await getCollection(collectionName);
    return await collection.countDocuments(query);
  } catch (error) {
    console.error(`❌ countDocuments error (${collectionName}):`, error);
    return 0;
  }
}




/**
 * Create backup before making changes
 */
async function createBackup() {
  try {
    const timestamp = new Date().toISOString();
    const backupsCol = await getCollection(COLLECTIONS.backups);

    // Get all current data (skip if no data exists yet)
    let data;
    try {
      data = await getData();

      // Only create backup if there's actual data
      if (!data.brands || data.brands.length === 0) {
        console.log('⚠️ No data to backup, skipping backup creation');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Cannot get data for backup, skipping backup creation');
      return true;
    }

    // Save backup
    await backupsCol.insertOne({
      timestamp,
      data,
      createdAt: new Date()
    });

    console.log(`📦 Backup created: ${timestamp}`);

    // Keep only last 50 backups
    const backupCount = await backupsCol.countDocuments();
    if (backupCount > 50) {
      const oldBackups = await backupsCol
        .find({})
        .sort({ timestamp: 1 })
        .limit(backupCount - 50)
        .toArray();

      const idsToDelete = oldBackups.map(b => b._id);
      await backupsCol.deleteMany({ _id: { $in: idsToDelete } });
    }

    return true;
  } catch (error) {
    console.error('❌ Backup creation error:', error);
    // Don't throw error - allow save to continue even if backup fails
    return false;
  }
}

/**
 * Save data to MongoDB (replaces entire dataset)
 */
export async function saveData(newData) {
  // Validate data structure
  if (!newData) {
    throw new Error('Invalid data: newData is null or undefined');
  }

  // Ensure all required arrays exist (even if empty)
  const validatedData = {
    brands: Array.isArray(newData.brands) ? newData.brands : [],
    models: Array.isArray(newData.models) ? newData.models : [],
    types: Array.isArray(newData.types) ? newData.types : [],
    engines: Array.isArray(newData.engines) ? newData.engines : [],
    stages: Array.isArray(newData.stages) ? newData.stages : []
  };

  try {
    // Create backup before making changes (non-blocking)
    try {
      await createBackup();
    } catch (backupError) {
      console.warn('⚠️ Backup failed, but continuing with save:', backupError.message);
    }

    // Clear existing data
    await Promise.all([
      (await getCollection(COLLECTIONS.brands)).deleteMany({}),
      (await getCollection(COLLECTIONS.models)).deleteMany({}),
      (await getCollection(COLLECTIONS.types)).deleteMany({}),
      (await getCollection(COLLECTIONS.engines)).deleteMany({}),
      (await getCollection(COLLECTIONS.stages)).deleteMany({})
    ]);

    // Insert new data (only if arrays are not empty)
    if (validatedData.brands.length > 0) {
      await (await getCollection(COLLECTIONS.brands)).insertMany(validatedData.brands);
    }
    if (validatedData.models.length > 0) {
      await (await getCollection(COLLECTIONS.models)).insertMany(validatedData.models);
    }
    if (validatedData.types.length > 0) {
      await (await getCollection(COLLECTIONS.types)).insertMany(validatedData.types);
    }
    if (validatedData.engines.length > 0) {
      await (await getCollection(COLLECTIONS.engines)).insertMany(validatedData.engines);
    }
    if (validatedData.stages.length > 0) {
      await (await getCollection(COLLECTIONS.stages)).insertMany(validatedData.stages);
    }

    console.log('✅ Data saved to MongoDB successfully');
    console.log(`   - Brands: ${validatedData.brands.length}`);
    console.log(`   - Models: ${validatedData.models.length}`);
    console.log(`   - Types: ${validatedData.types.length}`);
    console.log(`   - Engines: ${validatedData.engines.length}`);
    console.log(`   - Stages: ${validatedData.stages.length}`);

    return true;
  } catch (error) {
    console.error('❌ Save data error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Failed to save data to MongoDB: ${error.message}`);
  }
}

/**
 * Get all data from MongoDB
 * Note: This loads ALL data and should only be used in admin panel
 * For public pages, use specific functions like getBrands(), getModels(), etc.
 */
export async function getData() {
  try {
    const [brands, models, types, engines, stages] = await Promise.all([
      (await getCollection(COLLECTIONS.brands)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.models)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.types)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.engines)).find({}).sort({ name: 1 }).toArray(),
      (await getCollection(COLLECTIONS.stages)).find({}).sort({ id: 1 }).toArray()
    ]);

    // Remove MongoDB _id field from results
    const cleanData = {
      brands: brands.map(({ _id, ...rest }) => rest),
      models: models.map(({ _id, ...rest }) => rest),
      types: types.map(({ _id, ...rest }) => rest),
      engines: engines.map(({ _id, ...rest }) => rest),
      stages: stages.map(({ _id, ...rest }) => rest)
    };

    return cleanData;
  } catch (error) {
    console.error('❌ Get data error:', error);
    throw error;
  }
}


/**
 * ============================================================================
 * COLLECTION-SPECIFIC QUERY FUNCTIONS
 * Optimized functions for each collection with proper MongoDB queries
 * ============================================================================
 */

/**
 * Get all brands (sorted alphabetically by name)
 */
export async function getBrands() {
  return findBy(COLLECTIONS.brands, {}, null, { sort: { id: 1  } });
}

/**
 * Get a single brand by ID
 */
export async function getBrandById(brandId) {
  return findById(COLLECTIONS.brands, brandId);
}

/**
 * Get a brand by name or slug
 */
export async function getBrandByName(nameOrSlug) {
  try {
    const collection = await getCollection(COLLECTIONS.brands);
    const lowerName = nameOrSlug.toLowerCase();

    const brand = await collection.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${lowerName}$`, 'i') } },
        { slug: lowerName }
      ]
    });

    if (!brand) return null;
    const { _id, ...rest } = brand;
    return rest;
  } catch (error) {
    console.error('❌ getBrandByName error:', error);
    return null;
  }
}

/**
 * Get models by brandId (sorted alphabetically by name)
 */
export async function getModels(brandId) {
  if (!brandId) {
    return findBy(COLLECTIONS.models, {}, null, { sort: { name: 1 } });
  }
  return findBy(COLLECTIONS.models, 'brandId', parseInt(brandId), { sort: { name: 1 } });
}

/**
 * Get a single model by ID
 */
export async function getModelById(modelId) {
  return findById(COLLECTIONS.models, modelId);
}

/**
 * Get a model by name and brandId
 */
export async function getModelByName(brandId, nameOrSlug) {
  try {
    const collection = await getCollection(COLLECTIONS.models);
    const lowerName = nameOrSlug.toLowerCase();

    const model = await collection.findOne({
      brandId: parseInt(brandId),
      $or: [
        { name: { $regex: new RegExp(`^${lowerName}$`, 'i') } },
        { slug: lowerName }
      ]
    });

    if (!model) return null;
    const { _id, ...rest } = model;
    return rest;
  } catch (error) {
    console.error('❌ getModelByName error:', error);
    return null;
  }
}

/**
 * Get types by modelId (sorted alphabetically by name)
 */
export async function getTypes(modelId) {
  if (!modelId) {
    return findBy(COLLECTIONS.types, {}, null, { sort: { name: 1 } });
  }
  return findBy(COLLECTIONS.types, 'modelId', parseInt(modelId), { sort: { name: 1 } });
}

/**
 * Get a single type by ID
 */
export async function getTypeById(typeId) {
  return findById(COLLECTIONS.types, typeId);
}

/**
 * Get a type by name and modelId
 */
export async function getTypeByName(modelId, nameOrSlug) {
  try {
    const collection = await getCollection(COLLECTIONS.types);
    const lowerName = nameOrSlug.toLowerCase();

    const type = await collection.findOne({
      modelId: parseInt(modelId),
      $or: [
        { name: { $regex: new RegExp(`^${lowerName}$`, 'i') } },
        { slug: lowerName }
      ]
    });

    if (!type) return null;
    const { _id, ...rest } = type;
    return rest;
  } catch (error) {
    console.error('❌ getTypeByName error:', error);
    return null;
  }
}

/**
 * Get engines by typeId (sorted alphabetically by name)
 */
export async function getEngines(typeId) {
  if (!typeId) {
    return findBy(COLLECTIONS.engines, {}, null, { sort: { name: 1 } });
  }
  return findBy(COLLECTIONS.engines, 'typeId', parseInt(typeId), { sort: { name: 1 } });
}

/**
 * Get a single engine by ID
 */
export async function getEngineById(engineId) {
  return findById(COLLECTIONS.engines, engineId);
}

/**
 * Get an engine by name/slug/id and typeId
 */
export async function getEngineByName(typeId, nameOrSlugOrId) {
  try {
    const collection = await getCollection(COLLECTIONS.engines);
    const lowerName = nameOrSlugOrId.toLowerCase();

    const engine = await collection.findOne({
      typeId: parseInt(typeId),
      $or: [
        { name: { $regex: new RegExp(`^${lowerName}$`, 'i') } },
        { slug: lowerName },
        { id: parseInt(nameOrSlugOrId) || -1 }
      ]
    });

    if (!engine) return null;
    const { _id, ...rest } = engine;
    return rest;
  } catch (error) {
    console.error('❌ getEngineByName error:', error);
    return null;
  }
}

/**
 * Get stages by engineId (sorted by ID)
 */
export async function getStages(engineId) {
  if (!engineId) {
    return findBy(COLLECTIONS.stages, {}, null, { sort: { id: 1 } });
  }
  return findBy(COLLECTIONS.stages, 'engineId', parseInt(engineId), { sort: { id: 1 } });
}

/**
 * Get a single stage by ID
 */
export async function getStageById(stageId) {
  return findById(COLLECTIONS.stages, stageId);
}

/**
 * Update a stage
 */
export async function updateStage(stageId, updateData) {
  return updateById(COLLECTIONS.stages, stageId, updateData);
}


/**
 * Get all vehicles (for sitemap generation)
 */
export async function getAllVehicles() {
  try {
    const [brands, models, types, engines] = await Promise.all([
      getBrands(),
      getModels(),
      getTypes(),
      getEngines()
    ]);

    return { brands, models, types, engines };
  } catch (error) {
    console.error('❌ Get all vehicles error:', error);
    return { brands: [], models: [], types: [], engines: [] };
  }
}

/**
 * Get all backups
 */
export async function getBackups(limit = 50) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const backups = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .project({ _id: 1, timestamp: 1, createdAt: 1 })
      .toArray();

    return backups.map(b => ({
      id: b._id.toString(),
      timestamp: b.timestamp,
      createdAt: b.createdAt
    }));
  } catch (error) {
    console.error('❌ Get backups error:', error);
    return [];
  }
}

/**
 * Restore from backup
 */
export async function restoreBackup(backupId) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const { ObjectId } = require('mongodb');
    const backup = await collection.findOne({ _id: new ObjectId(backupId) });

    if (!backup) {
      throw new Error('Backup not found');
    }

    await saveData(backup.data, false);
    console.log(`✅ Restored from backup: ${backup.timestamp}`);
    return true;
  } catch (error) {
    console.error('❌ Restore backup error:', error);
    throw error;
  }
}

/**
 * Delete old backups (keep only the most recent N backups)
 */
export async function cleanupBackups(keepCount = 50) {
  try {
    const collection = await getCollection(COLLECTIONS.backups);
    const backupCount = await collection.countDocuments();

    if (backupCount > keepCount) {
      const oldBackups = await collection
        .find({})
        .sort({ timestamp: 1 })
        .limit(backupCount - keepCount)
        .toArray();

      const idsToDelete = oldBackups.map(b => b._id);
      await collection.deleteMany({ _id: { $in: idsToDelete } });

      console.log(`✅ Cleaned up ${idsToDelete.length} old backups`);
    }

    return true;
  } catch (error) {
    console.error('❌ Cleanup backups error:', error);
    throw error;
  }
}


