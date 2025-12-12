import { validateCredentials, createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = createToken(username);
    return NextResponse.json({ token, role: 'admin' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}

