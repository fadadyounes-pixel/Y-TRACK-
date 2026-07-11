import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Block /ideamap on talentmaponline.org — redirect to the correct domain
  if (host.includes('talentmaponline.org') && pathname.startsWith('/ideamap')) {
    return NextResponse.redirect('https://www.ideamaponline.org', { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/ideamap/:path*',
};
