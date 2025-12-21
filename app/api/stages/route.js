import { getStages } from '@/lib/data';
import { NextResponse } from 'next/server';

// Force dynamic - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const engineId = searchParams.get('engineId');
    const stages = await getStages(engineId);
    return NextResponse.json(stages, { headers: noCacheHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
  }
}

