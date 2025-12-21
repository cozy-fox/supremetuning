import { getGroups } from '@/lib/data';
import { NextResponse } from 'next/server';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * GET /api/groups?brandId=xxx - Get all groups for a brand
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');

    const groups = await getGroups(brandId ? parseInt(brandId) : null);

    return NextResponse.json(groups, { headers: noCacheHeaders });
  } catch (error) {
    console.error('❌ Get groups error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch groups', error: error.message },
      { status: 500 }
    );
  }
}

