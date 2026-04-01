import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

export function middleware(_request: NextRequest) {
  // 为每个请求生成唯一 nonce，防止 XSS
  const nonce = randomBytes(16).toString('base64');
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...(Object.fromEntries(_request.headers.entries())),
        'x-nonce': nonce,
      }),
    },
  });

  // 安全头配置
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy — nonce-based，移除 'unsafe-inline'
  // Next.js RSC/SSR 使用 nonce 注入内联脚本，需要在 _document 或 layout 中读取 x-nonce header
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'", // CSS-in-JS（Tailwind）需要保留，不影响 XSS（style 注入危害远低于 script）
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.github.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  // 将 nonce 暴露给 layout/document 组件读取
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 