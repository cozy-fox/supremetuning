import { getData, saveData } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const newData = await request.json();
    await saveData(newData);
    return NextResponse.json({ message: 'Database saved and backed up successfully.' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Save failed', error: error.message },
      { status: 500 }
    );
  }
}

