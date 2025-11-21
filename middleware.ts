import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/resume/create',
  '/resume/tailor',
  '/editor',
  '/profile',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtectedRoute) {
    // Check for auth token
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Redirect to login page if no token found
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify token by calling the /api/auth/me endpoint
      const response = await fetch(new URL('/api/auth/me', request.url), {
        headers: {
          Cookie: `auth_token=${token}`,
        },
      });
      
      if (!response.ok) {
        // Token is invalid, redirect to login
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error verifying token in middleware:', error);
      // On error, redirect to login
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resume/:path*',
    '/editor/:path*',
    '/profile/:path*',
  ],
};
