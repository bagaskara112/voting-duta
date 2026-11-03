import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMaintenanceConfig } from '@/lib/maintenance';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allowed paths that should never be blocked by maintenance
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  // 2. Check if user has an authorized bypass cookie
  const bypassCookie = request.cookies.get('maintenance_bypass');
  if (bypassCookie?.value === 'true') {
    return NextResponse.next();
  }

  // 3. Check maintenance status from database (cached in-memory for 5s)
  const config = await getMaintenanceConfig();

  if (config.isMaintenance) {
    // Rewrite to /maintenance while preserving URL for user
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes, including /api/auth and /api/maintenance)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (public images)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - maintenance (our maintenance page route itself)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|maintenance).*)',
  ],
};
