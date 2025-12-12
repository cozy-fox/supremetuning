import { getBackups, restoreBackup, getData } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * GET /api/backups - Get list of all backups
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
    const backups = await getBackups(100); // Get last 100 backups
    return NextResponse.json(backups);
  } catch (error) {
    console.error('❌ Get backups error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch backups', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backups - Create a new manual backup
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
    const timestamp = new Date().toISOString();
    const backupsCol = await getCollection('backups');

    // Get all current data
    const data = await getData();

    // Only create backup if there's actual data
    if (!data.brands || data.brands.length === 0) {
      return NextResponse.json(
        { message: 'No data to backup' },
        { status: 400 }
      );
    }

    // Save backup
    const result = await backupsCol.insertOne({
      timestamp,
      data,
      createdAt: new Date(),
      manual: true, // Mark as manual backup
      description: 'Manual backup created from admin panel'
    });

    console.log(`📦 Manual backup created: ${timestamp}`);

    // Keep only last 100 backups
    const backupCount = await backupsCol.countDocuments();
    if (backupCount > 100) {
      const oldBackups = await backupsCol
        .find({})
        .sort({ timestamp: 1 })
        .limit(backupCount - 100)
        .toArray();

      const idsToDelete = oldBackups.map(b => b._id);
      await backupsCol.deleteMany({ _id: { $in: idsToDelete } });
    }

    return NextResponse.json({ 
      message: 'Backup created successfully',
      id: result.insertedId.toString(),
      timestamp
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
 * DELETE /api/backups?id=xxx - Delete a specific backup
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
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const backupsCol = await getCollection('backups');
    const { ObjectId } = require('mongodb');
    
    const result = await backupsCol.deleteOne({ _id: new ObjectId(backupId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Backup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete backup error:', error);
    return NextResponse.json(
      { message: 'Failed to delete backup', error: error.message },
      { status: 500 }
    );
  }
}

