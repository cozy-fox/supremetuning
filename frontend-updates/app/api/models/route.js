import { getModels } from '@/lib/data';
import { NextResponse } from 'next/server';

/**
 * GET /api/models?brandId=1&groupId=2
 * Returns models filtered by brandId and optionally by groupId
 * Now uses database groupId field instead of regex-based filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const groupId = searchParams.get('groupId');

    if (!brandId && !groupId) {
      return NextResponse.json({ error: 'brandId or groupId is required' }, { status: 400 });
    }

    // getModels now accepts optional groupId parameter
    // If groupId is provided, it filters by groupId
    // If only brandId is provided, it returns all models for the brand
    const models = await getModels(brandId, groupId);

    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

