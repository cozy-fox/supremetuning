import { getEngines } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get('typeId');
    const engines = await getEngines(typeId);
    return NextResponse.json(engines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch engines' }, { status: 500 });
  }
}

