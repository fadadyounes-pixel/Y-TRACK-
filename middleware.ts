import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // ── ideamaponline.org → serve IdeaMap (/ideamap) ──────────────────────────
  if (host.includes('ideamaponline.org')) {
    // Let Next.js internals, API routes, and static files pass through unchanged
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon') ||
      pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/)
    ) {
      return NextResponse.next();
    }

    // Rewrite / and any sub-path to /ideamap (transparent — URL in browser stays clean)
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/ideamap', request.url));
    }

    // Sub-paths like /ideamap/... pass through as-is
    if (pathname.startsWith('/ideamap')) {
      return NextResponse.next();
    }

    // Any other path on ideamaponline.org → rewrite to /ideamap equivalent
    return NextResponse.rewrite(new URL('/ideamap' + pathname, request.url));
  }

  // ── talentmaponline.org → serve TalentMap, block /ideamap access ──────────
  if (host.includes('talentmaponline.org') && pathname.startsWith('/ideamap')) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
