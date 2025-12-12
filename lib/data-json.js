/**
 * Data Service for Next.js - Server-side data operations
 */
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'supreme-tuning-master.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

let dbCache = null;

export async function initDataLayer() {
  if (dbCache) return dbCache;
  
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    dbCache = JSON.parse(data);
    console.log(`📦 Data loaded: ${dbCache.brands?.length || 0} brands.`);
    return dbCache;
  } catch (e) {
    if (e.code === 'ENOENT' || e instanceof SyntaxError) {
      console.warn("⚠️ Data file not found. Initializing empty cache.");
      dbCache = { brands: [], models: [], types: [], engines: [], stages: [] };
      await saveData(dbCache);
      return dbCache;
    }
    throw e;
  }
}

/**
 * Reorder IDs to be sequential (1, 2, 3...) and update all foreign key references
 * This ensures clean, gap-free IDs after deletions
 */
function reorderIds(data) {
  const idMaps = {
    brands: new Map(),
    models: new Map(),
    types: new Map(),
    engines: new Map(),
    stages: new Map()
  };

  // Step 1: Reorder brands and create ID mapping
  data.brands = data.brands.map((item, index) => {
    const newId = index + 1;
    idMaps.brands.set(item.id, newId);
    return { ...item, id: newId };
  });

  // Step 2: Reorder models, update brandId references
  data.models = data.models.map((item, index) => {
    const newId = index + 1;
    idMaps.models.set(item.id, newId);
    return {
      ...item,
      id: newId,
      brandId: idMaps.brands.get(item.brandId) || item.brandId
    };
  });

  // Step 3: Reorder types, update modelId and brandId references
  data.types = data.types.map((item, index) => {
    const newId = index + 1;
    idMaps.types.set(item.id, newId);
    return {
      ...item,
      id: newId,
      modelId: idMaps.models.get(item.modelId) || item.modelId,
      brandId: idMaps.brands.get(item.brandId) || item.brandId
    };
  });

  // Step 4: Reorder engines, update typeId and modelId references
  data.engines = data.engines.map((item, index) => {
    const newId = index + 1;
    idMaps.engines.set(item.id, newId);
    return {
      ...item,
      id: newId,
      typeId: idMaps.types.get(item.typeId) || item.typeId,
      modelId: idMaps.models.get(item.modelId) || item.modelId
    };
  });

  // Step 5: Reorder stages, update engineId references
  data.stages = data.stages.map((item, index) => {
    const newId = index + 1;
    idMaps.stages.set(item.id, newId);
    return {
      ...item,
      id: newId,
      engineId: idMaps.engines.get(item.engineId) || item.engineId
    };
  });

  return data;
}

export async function saveData(newData, skipReorder = false) {
  if (!newData || !newData.brands) {
    throw new Error("Invalid data structure provided for save operation.");
  }

  // Backup existing data
  if (dbCache) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      path.join(BACKUP_DIR, `backup-${timestamp}.json`),
      JSON.stringify(dbCache, null, 2)
    );
  }

  // Reorder IDs to be sequential (unless explicitly skipped)
  const dataToSave = skipReorder ? newData : reorderIds(newData);

  // Write new data
  await fs.writeFile(DATA_FILE, JSON.stringify(dataToSave, null, 2));
  dbCache = dataToSave;
  return true;
}

export async function getData() {
  if (!dbCache) await initDataLayer();
  return dbCache;
}

export async function getBrands() {
  const data = await getData();
  return data.brands || [];
}

export async function getModels(brandId) {
  const data = await getData();
  if (!brandId) return data.models || [];
  return (data.models || []).filter(m => m.brandId === parseInt(brandId));
}

export async function getTypes(modelId) {
  const data = await getData();
  if (!modelId) return data.types || [];
  return (data.types || []).filter(t => t.modelId === parseInt(modelId));
}

export async function getEngines(typeId) {
  const data = await getData();
  if (!typeId) return data.engines || [];
  return (data.engines || []).filter(e => e.typeId === parseInt(typeId));
}

export async function getStages(engineId) {
  const data = await getData();
  if (!engineId) return data.stages || [];
  return (data.stages || []).filter(s => s.engineId === parseInt(engineId));
}

// Helper functions for SEO - get items by name/slug
export async function getBrandByName(name) {
  const brands = await getBrands();
  return brands.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export async function getModelByName(brandId, name) {
  const models = await getModels(brandId);
  return models.find(m => m.name.toLowerCase() === name.toLowerCase());
}

export async function getTypeByName(modelId, name) {
  const types = await getTypes(modelId);
  return types.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export async function getEngineById(engineId) {
  const data = await getData();
  return (data.engines || []).find(e => e.id === parseInt(engineId));
}

// Get all data for sitemap generation
export async function getAllVehicles() {
  const data = await getData();
  return {
    brands: data.brands || [],
    models: data.models || [],
    types: data.types || [],
    engines: data.engines || [],
  };
}

