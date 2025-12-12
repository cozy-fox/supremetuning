import { restoreBackup } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * POST /api/backups/restore - Restore from a specific backup
 * Body: { backupId: string }
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

    await restoreBackup(backupId);

    return NextResponse.json({ 
      message: 'Database restored successfully from backup'
    });
  } catch (error) {
    console.error('❌ Restore backup error:', error);
    return NextResponse.json(
      { message: 'Failed to restore backup', error: error.message },
      { status: 500 }
    );
  }
}

