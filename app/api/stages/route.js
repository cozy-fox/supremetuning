import { getStages } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const engineId = searchParams.get('engineId');
    const stages = await getStages(engineId);
    return NextResponse.json(stages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
  }
}

