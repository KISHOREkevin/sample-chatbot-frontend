import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths requiring authentication
  const isProtectedPath = pathname.startsWith('/chat');
  
  // Paths for unauthenticated users only
  const isAuthPath = pathname.startsWith('/login');

  if (isProtectedPath && !token) {
    // Redirect to login if trying to access chat without token
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && token) {
    // Redirect to chat if trying to access login while already authenticated
    const chatUrl = new URL('/chat', request.url);
    return NextResponse.redirect(chatUrl);
  }

  // Handle root URL redirection
  if (pathname === '/') {
    if (token) {
      const chatUrl = new URL('/chat', request.url);
      return NextResponse.redirect(chatUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: ['/', '/chat/:path*', '/login'],
};
