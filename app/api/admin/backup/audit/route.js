import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getRecentAuditLogs, getAuditHistory, rollbackToVersion } from '@/lib/backup-service';
import { findById } from '@/lib/data';

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

    // Enhance logs with resolved names
    const enhancedLogs = await Promise.all(logs.map(async (log) => {
      const enhanced = { ...log };

      // Resolve document name based on collection
      try {
        if (log.collection && log.documentId) {
          const doc = await findById(log.collection, log.documentId);
          if (doc) {
            enhanced.documentName = doc.name || doc.stageName || `ID: ${log.documentId}`;
          }
        }
      } catch (error) {
        // If document not found, keep original
      }

      // Resolve IDs in changes to names
      if (log.changes) {
        enhanced.resolvedChanges = {};
        for (const [field, change] of Object.entries(log.changes)) {
          enhanced.resolvedChanges[field] = { ...change };

          // Resolve brandId, modelId, typeId, engineId to names
          if (field.endsWith('Id') && typeof change.to === 'number') {
            const collectionName = field.replace('Id', '') + 's'; // brandId -> brands
            try {
              const item = await findById(collectionName, change.to);
              if (item) {
                enhanced.resolvedChanges[field].toName = item.name || item.stageName;
              }
            } catch (error) {
              // Keep original if not found
            }
          }

          if (field.endsWith('Id') && typeof change.from === 'number') {
            const collectionName = field.replace('Id', '') + 's';
            try {
              const item = await findById(collectionName, change.from);
              if (item) {
                enhanced.resolvedChanges[field].fromName = item.name || item.stageName;
              }
            } catch (error) {
              // Keep original if not found
            }
          }
        }
      }

      return enhanced;
    }));

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

