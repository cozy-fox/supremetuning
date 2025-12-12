import { requireAdmin, hashPassword, saveAdminCredentials, validateCredentials, getCurrentUsername } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { currentPassword, newUsername, newPassword } = await request.json();

    // Validate current password
    const currentUsername = getCurrentUsername();
    if (!validateCredentials(currentUsername, currentPassword)) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Validate new credentials
    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json(
        { message: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash new password and save
    const hashedPassword = hashPassword(newPassword);
    saveAdminCredentials(newUsername, hashedPassword);

    return NextResponse.json({ 
      message: 'Credentials updated successfully',
      username: newUsername
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update credentials', error: error.message },
      { status: 500 }
    );
  }
}

