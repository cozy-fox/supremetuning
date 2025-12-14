import { getGroups } from '@/lib/data';
import { NextResponse } from 'next/server';

/**
 * GET /api/groups?brandId=xxx - Get all groups for a brand
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    const groups = await getGroups(brandId ? parseInt(brandId) : null);

    return NextResponse.json(groups);
  } catch (error) {
    console.error('❌ Get groups error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch groups', error: error.message },
      { status: 500 }
    );
  }
}

