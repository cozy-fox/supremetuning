import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { createFullBackup, getFullBackups, cleanupOldBackups } from '@/lib/backup-service';

/**
 * GET /api/admin/backup/full - Get list of full backups
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
    const backups = await getFullBackups(50);
    return NextResponse.json({ backups });
  } catch (error) {
    console.error('❌ Get backups error:', error);
    return NextResponse.json(
      { message: 'Failed to get backups', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backup/full - Create a new full backup
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
    const { description = 'Manual backup from admin panel', type = 'manual' } = await request.json().catch(() => ({}));
    
    // Create full backup
    const backup = await createFullBackup(type, description, 'admin');
    
    // Cleanup old backups (keep last 30)
    await cleanupOldBackups(30);

    return NextResponse.json({
      message: 'Full backup created successfully',
      backup
    });
  } catch (error) {
    console.error('❌ Create backup error:', error);
    return NextResponse.json(
      { message: 'Failed to create backup', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/backup/full - Cleanup old backups
 */
export async function DELETE(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const keepCount = parseInt(searchParams.get('keep') || '30');
    
    const deletedCount = await cleanupOldBackups(keepCount);

    return NextResponse.json({
      message: `Cleaned up ${deletedCount} old backups`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { message: 'Failed to cleanup backups', error: error.message },
      { status: 500 }
    );
  }
}

