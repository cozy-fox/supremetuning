/**
 * Data Service for Next.js - Read-only MongoDB operations
 * Updated to support groups collection
 */
import { getCollection } from './mongodb.js';

/**
 * Helper function to serialize MongoDB documents for Next.js Client Components
 * Converts ObjectId to string to avoid "Objects with toJSON methods are not supported" error
 */
function serializeDoc(doc) {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id.toString()
  };
}

function serializeDocs(docs) {
  return docs.map(serializeDoc);
}

/**
 * Get all brands from MongoDB
 */
export async function getBrands() {
  const collection = await getCollection('brands');
  const brands = await collection.find({}).sort({ id: 1 }).toArray();
  return serializeDocs(brands);
}

/**
 * Get groups for a brand from MongoDB
 * @param {number} brandId - The brand ID to filter groups by
 * @returns {Promise<Array>} Array of group documents
 */
export async function getGroups(brandId) {
  const collection = await getCollection('groups');
  const query = brandId ? { brandId: parseInt(brandId) } : {};
  const groups = await collection.find(query).sort({ order: 1, name: 1 }).toArray();
  return serializeDocs(groups);
}

/**
 * Get a single group by ID
 * @param {number} groupId - The group ID
 * @returns {Promise<Object|null>} Group document or null
 */
export async function getGroupById(groupId) {
  const collection = await getCollection('groups');
  const group = await collection.findOne({ id: parseInt(groupId) });
  return serializeDoc(group);
}

/**
 * Check if a brand has performance groups (more than just Standard)
 * Returns true only if there are multiple groups or a performance group
 * This determines whether to show the group selector on the frontend
 * @param {number} brandId - The brand ID to check
 * @returns {Promise<boolean>} True if the brand has multiple/performance groups
 */
export async function brandHasGroups(brandId) {
  const collection = await getCollection('groups');
  const groups = await collection.find({ brandId: parseInt(brandId) }).toArray();

  // If no groups, return false
  if (groups.length === 0) return false;

  // If more than one group, return true (show selector)
  if (groups.length > 1) return true;

  // If only one group and it's a performance group, show selector
  if (groups[0].isPerformance) return true;

  // Only one non-performance group (Standard) - don't show selector
  return false;
}

/**
 * Get the default/only group for a brand
 * Used when brand has only Standard group (no selector shown)
 * @param {number} brandId - The brand ID
 * @returns {Promise<Object|null>} The default group or null
 */
export async function getDefaultGroup(brandId) {
  const collection = await getCollection('groups');
  const group = await collection.findOne({ brandId: parseInt(brandId) });
  return serializeDoc(group);
}

/**
 * Get models filtered by brandId and optionally by groupId
 * @param {number} brandId - The brand ID (required)
 * @param {number} groupId - Optional group ID to filter by
 * @returns {Promise<Array>} Array of model documents
 */
export async function getModels(brandId, groupId = null) {
  const collection = await getCollection('models');
  
  let query = {};
  
  if (groupId) {
    // If groupId is provided, filter by groupId
    query = { groupId: parseInt(groupId) };
  } else if (brandId) {
    // If only brandId is provided, filter by brandId
    query = { brandId: parseInt(brandId) };
  }
  
  const models = await collection.find(query).sort({ name: 1 }).toArray();
  return serializeDocs(models);
}

/**
 * Get types/generations filtered by modelId
 */
export async function getTypes(modelId) {
  const collection = await getCollection('types');
  const types = await collection.find({ modelId: parseInt(modelId) }).sort({ id: 1 }).toArray();
  return serializeDocs(types);
}

/**
 * Get engines filtered by typeId
 */
export async function getEngines(typeId) {
  const collection = await getCollection('engines');
  const engines = await collection.find({ typeId: parseInt(typeId) }).sort({ id: 1 }).toArray();
  return serializeDocs(engines);
}

/**
 * Get stages filtered by engineId
 */
export async function getStages(engineId) {
  const collection = await getCollection('stages');
  const stages = await collection.find({ engineId: parseInt(engineId) }).sort({ id: 1 }).toArray();
  return serializeDocs(stages);
}

/**
 * Get engine by ID
 */
export async function getEngineById(engineId) {
  const collection = await getCollection('engines');
  const engine = await collection.findOne({ id: parseInt(engineId) });
  return serializeDoc(engine);
}

/**
 * Get brand by name (for SEO routing)
 */
export async function getBrandByName(name) {
  const collection = await getCollection('brands');
  const brand = await collection.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(brand);
}

/**
 * Get model by brandId and name (for SEO routing)
 */
export async function getModelByName(brandId, name) {
  const collection = await getCollection('models');
  const model = await collection.findOne({
    brandId: parseInt(brandId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(model);
}

/**
 * Get type by modelId and name (for SEO routing)
 */
export async function getTypeByName(modelId, name) {
  const collection = await getCollection('types');
  const type = await collection.findOne({
    modelId: parseInt(modelId),
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  return serializeDoc(type);
}

/**
 * Get all vehicles for sitemap generation
 */
export async function getAllVehicles() {
  const [brands, models, types, engines] = await Promise.all([
    getCollection('brands').then(c => c.find({}).toArray()),
    getCollection('models').then(c => c.find({}).toArray()),
    getCollection('types').then(c => c.find({}).toArray()),
    getCollection('engines').then(c => c.find({}).toArray())
  ]);

  return {
    brands: serializeDocs(brands),
    models: serializeDocs(models),
    types: serializeDocs(types),
    engines: serializeDocs(engines)
  };
}

