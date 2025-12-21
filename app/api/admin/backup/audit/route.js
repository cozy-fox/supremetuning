import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getRecentAuditLogs, getAuditHistory, rollbackToVersion } from '@/lib/backup-service';
import { findById } from '@/lib/data';
import { getCollection } from '@/lib/mongodb';

/**
 * Load all entities into cache for fast lookups
 * This is much faster than individual findById calls
 */
async function loadEntityCache() {
  const cache = {
    brands: new Map(),
    groups: new Map(),
    models: new Map(),
    types: new Map(),
    engines: new Map()
  };

  try {
    const collections = ['brands', 'groups', 'models', 'types', 'engines'];
    await Promise.all(collections.map(async (collName) => {
      const col = await getCollection(collName);
      const docs = await col.find({}).toArray();
      docs.forEach(doc => {
        cache[collName].set(doc.id, { id: doc.id, name: doc.name || doc.stageName, brandId: doc.brandId, groupId: doc.groupId, modelId: doc.modelId, typeId: doc.typeId, engineId: doc.engineId });
      });
    }));
  } catch (error) {
    console.error('Failed to load entity cache:', error);
  }

  return cache;
}

/**
 * Resolve full hierarchy path using cache (fast)
 */
function resolveHierarchyPathCached(collection, doc, cache) {
  const path = [];

  try {
    switch (collection) {
      case 'brands':
        path.push(doc.name);
        break;

      case 'groups':
        if (doc.brandId && cache.brands.has(doc.brandId)) {
          path.push(cache.brands.get(doc.brandId).name);
        }
        path.push(doc.name);
        break;

      case 'models':
        if (doc.groupId && cache.groups.has(doc.groupId)) {
          const group = cache.groups.get(doc.groupId);
          if (group.brandId && cache.brands.has(group.brandId)) {
            path.push(cache.brands.get(group.brandId).name);
          }
          path.push(group.name);
        }
        path.push(doc.name);
        break;

      case 'types':
        if (doc.modelId && cache.models.has(doc.modelId)) {
          const model = cache.models.get(doc.modelId);
          if (model.groupId && cache.groups.has(model.groupId)) {
            const group = cache.groups.get(model.groupId);
            if (group.brandId && cache.brands.has(group.brandId)) {
              path.push(cache.brands.get(group.brandId).name);
            }
            path.push(group.name);
          }
          path.push(model.name);
        }
        path.push(doc.name);
        break;

      case 'engines':
        if (doc.typeId && cache.types.has(doc.typeId)) {
          const type = cache.types.get(doc.typeId);
          if (type.modelId && cache.models.has(type.modelId)) {
            const model = cache.models.get(type.modelId);
            if (model.groupId && cache.groups.has(model.groupId)) {
              const group = cache.groups.get(model.groupId);
              if (group.brandId && cache.brands.has(group.brandId)) {
                path.push(cache.brands.get(group.brandId).name);
              }
              path.push(group.name);
            }
            path.push(model.name);
          }
          path.push(type.name);
        }
        path.push(doc.name);
        break;

      case 'stages':
        if (doc.engineId && cache.engines.has(doc.engineId)) {
          const engine = cache.engines.get(doc.engineId);
          if (engine.typeId && cache.types.has(engine.typeId)) {
            const type = cache.types.get(engine.typeId);
            if (type.modelId && cache.models.has(type.modelId)) {
              const model = cache.models.get(type.modelId);
              if (model.groupId && cache.groups.has(model.groupId)) {
                const group = cache.groups.get(model.groupId);
                if (group.brandId && cache.brands.has(group.brandId)) {
                  path.push(cache.brands.get(group.brandId).name);
                }
                path.push(group.name);
              }
              path.push(model.name);
            }
            path.push(type.name);
          }
          path.push(engine.name);
        }
        path.push(doc.stageName || doc.name);
        break;
    }
  } catch (error) {
    console.error('Error resolving hierarchy path:', error);
  }

  return path.filter(Boolean).join(' → ');
}

/**
 * Check if value looks like logo data (base64 or URL)
 */
function isLogoData(value) {
  if (typeof value !== 'string') return false;
  return value.startsWith('data:image') ||
         value.startsWith('http') ||
         value.length > 200; // Long strings are likely base64
}

/**
 * Format stage data changes for display
 */
function formatStageDetails(doc) {
  if (!doc) return null;

  const details = {};

  if (doc.stageName) details.stageName = doc.stageName;
  if (doc.price !== undefined) details.price = `€${doc.price}`;
  if (doc.stockPower !== undefined) details.stockPower = `${doc.stockPower} PK`;
  if (doc.tunedPower !== undefined) details.tunedPower = `${doc.tunedPower} PK`;
  if (doc.stockTorque !== undefined) details.stockTorque = `${doc.stockTorque} Nm`;
  if (doc.tunedTorque !== undefined) details.tunedTorque = `${doc.tunedTorque} Nm`;
  if (doc.ecuUnlock !== undefined) details.ecuUnlock = doc.ecuUnlock ? 'Yes' : 'No';
  if (doc.cpcUpgrade !== undefined) details.cpcUpgrade = doc.cpcUpgrade ? 'Yes' : 'No';

  return Object.keys(details).length > 0 ? details : null;
}

/**
 * Sanitize log data - remove logo data, keep only essential fields
 */
function sanitizeLogData(data) {
  if (!data) return null;

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip internal MongoDB fields
    if (key.startsWith('_')) continue;

    // Replace logo data with indicator
    if (key === 'logo' || key.includes('logo') || key.includes('Logo')) {
      if (value && isLogoData(value)) {
        sanitized[key] = '[Logo Data]';
      } else if (value) {
        sanitized[key] = '[Logo Updated]';
      }
      continue;
    }

    // Keep other values
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * GET /api/admin/backup/audit - Get audit logs
 * Query params:
 *   - limit: number of logs to return (default: 100)
 *   - collection: filter by collection name
 *   - action: filter by action type
 *   - documentId: get history for specific document (requires collection param)
 */
export async function GET(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const collection = searchParams.get('collection');
    const action = searchParams.get('action');
    const documentId = searchParams.get('documentId');

    // Load entity cache once for all lookups (much faster than individual queries)
    const cache = await loadEntityCache();

    let logs;

    // Get history for specific document
    if (collection && documentId) {
      logs = await getAuditHistory(collection, parseInt(documentId), limit);
    } else {
      // Get recent logs with filters
      const filters = {};
      if (collection) filters.collection = collection;
      if (action) filters.action = action;

      logs = await getRecentAuditLogs(limit, filters);
    }

    // Enhance logs with resolved names and hierarchy (using cache for speed)
    const enhancedLogs = logs.map((log) => {
      const enhanced = { ...log };

      // Sanitize before/after data - remove logo data
      enhanced.before = sanitizeLogData(log.before);
      enhanced.after = sanitizeLogData(log.after);

      // Get the document data (prefer 'after' for current state, or 'before' if deleted)
      const docData = log.after || log.before;

      // Resolve full hierarchy path using cache (fast)
      if (log.collection && docData) {
        enhanced.hierarchyPath = resolveHierarchyPathCached(log.collection, docData, cache);
        enhanced.documentName = docData.name || docData.stageName || `ID: ${log.documentId}`;
      }

      // For stages, include detailed data
      if (log.collection === 'stages') {
        enhanced.stageDetails = {
          before: formatStageDetails(log.before),
          after: formatStageDetails(log.after)
        };
      }

      // Process changes - use cache for ID lookups and handle logo fields
      if (log.changes) {
        enhanced.resolvedChanges = {};
        for (const [field, change] of Object.entries(log.changes)) {
          // Handle logo fields specially
          if (field === 'logo' || field.includes('logo') || field.includes('Logo')) {
            enhanced.resolvedChanges[field] = {
              from: change.from ? '[Logo Data]' : null,
              to: change.to ? '[Logo Data]' : null,
              isLogo: true
            };
            continue;
          }

          enhanced.resolvedChanges[field] = { ...change };

          // Resolve IDs to names using cache
          if (field.endsWith('Id') && typeof change.to === 'number') {
            const collectionName = field.replace('Id', '') + 's';
            if (cache[collectionName]?.has(change.to)) {
              enhanced.resolvedChanges[field].toName = cache[collectionName].get(change.to).name;
            }
          }

          if (field.endsWith('Id') && typeof change.from === 'number') {
            const collectionName = field.replace('Id', '') + 's';
            if (cache[collectionName]?.has(change.from)) {
              enhanced.resolvedChanges[field].fromName = cache[collectionName].get(change.from).name;
            }
          }

          // Format numeric fields with units
          if (!field.endsWith('Id')) {
            if (field.includes('Power')) {
              enhanced.resolvedChanges[field].fromFormatted = change.from !== null ? `${change.from} PK` : null;
              enhanced.resolvedChanges[field].toFormatted = change.to !== null ? `${change.to} PK` : null;
            } else if (field.includes('Torque')) {
              enhanced.resolvedChanges[field].fromFormatted = change.from !== null ? `${change.from} Nm` : null;
              enhanced.resolvedChanges[field].toFormatted = change.to !== null ? `${change.to} Nm` : null;
            } else if (field === 'price') {
              enhanced.resolvedChanges[field].fromFormatted = change.from !== null ? `€${change.from}` : null;
              enhanced.resolvedChanges[field].toFormatted = change.to !== null ? `€${change.to}` : null;
            }
          }
        }
      }

      return enhanced;
    });

    return NextResponse.json({ logs: enhancedLogs, count: enhancedLogs.length });
  } catch (error) {
    console.error('❌ Get audit logs error:', error);
    return NextResponse.json(
      { message: 'Failed to get audit logs', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backup/audit/rollback - Rollback to a specific version
 */
export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { collection, documentId, version } = await request.json();

    if (!collection || !documentId || !version) {
      return NextResponse.json(
        { message: 'Collection, documentId, and version are required' },
        { status: 400 }
      );
    }

    await rollbackToVersion(collection, documentId, version);

    return NextResponse.json({
      message: `Successfully rolled back ${collection}/${documentId} to version ${version}`
    });
  } catch (error) {
    console.error('❌ Rollback error:', error);
    return NextResponse.json(
      { message: 'Failed to rollback', error: error.message },
      { status: 500 }
    );
  }
}

