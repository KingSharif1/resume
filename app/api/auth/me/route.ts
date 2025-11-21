import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser(token);

    if (!user) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in me route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
