import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { restoreFullBackup } from '@/lib/backup-service';

/**
 * POST /api/admin/backup/restore - Restore from a full backup
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
    const { backupId } = await request.json();

    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    await restoreFullBackup(backupId);

    return NextResponse.json({
      message: 'Database restored successfully from full backup'
    });
  } catch (error) {
    console.error('❌ Restore error:', error);
    return NextResponse.json(
      { message: 'Failed to restore backup', error: error.message },
      { status: 500 }
    );
  }
}

