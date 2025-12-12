import { getTypes } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const types = await getTypes(modelId);
    return NextResponse.json(types);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }
}

