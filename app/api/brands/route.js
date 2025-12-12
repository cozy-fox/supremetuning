import { getBrands } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

