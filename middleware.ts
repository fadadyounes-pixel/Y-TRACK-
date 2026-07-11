import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Redirect ALL ideamaponline.org traffic → talentmaponline.org
  if (host.includes('ideamaponline.org')) {
    return NextResponse.redirect('https://www.talentmaponline.org', { status: 301 });
  }

  // Block /ideamap on talentmaponline.org
  if (host.includes('talentmaponline.org') && pathname.startsWith('/ideamap')) {
    return NextResponse.redirect('https://www.talentmaponline.org', { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/ideamap/:path*'],
};
