import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // ideamaponline.org → serve IdeaMap at /ideamap
  if (host.includes('ideamaponline.org')) {
    // Already at /ideamap/* — let through as-is
    if (pathname.startsWith('/ideamap')) {
      return NextResponse.next();
    }
    // Rewrite root (and any other path) to /ideamap so the IdeaMap app loads
    const url = request.nextUrl.clone();
    url.pathname = '/ideamap';
    return NextResponse.rewrite(url);
  }

  // talentmaponline.org — block /ideamap, keep TalentMap at root
  if (host.includes('talentmaponline.org') && pathname.startsWith('/ideamap')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
