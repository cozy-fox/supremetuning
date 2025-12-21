import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * POST /api/admin/migrate-brands - Migrate existing brands to have isTest field
 * This sets isTest: false for all brands that don't have this field yet
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
    const brandsCol = await getCollection('brands');
    
    // Update all brands that don't have isTest field to have isTest: false
    const result = await brandsCol.updateMany(
      { isTest: { $exists: false } },
      { $set: { isTest: false } }
    );

    console.log(`✅ Migrated ${result.modifiedCount} brands to have isTest field`);

    return NextResponse.json({
      message: 'Migration completed successfully',
      migratedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json(
      { message: 'Migration failed', error: error.message },
      { status: 500 }
    );
  }
}

