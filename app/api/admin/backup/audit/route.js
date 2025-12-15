import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getRecentAuditLogs, getAuditHistory, rollbackToVersion } from '@/lib/backup-service';

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

    return NextResponse.json({ logs, count: logs.length });
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

