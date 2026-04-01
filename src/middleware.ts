import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // 安全头配置
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  // 说明：Next.js 静态预渲染的页面在构建期生成 HTML，不经过 middleware，
  // 因此 nonce-based CSP（需要每次请求动态生成 nonce）与静态页面不兼容。
  // 使用 'self' + 'unsafe-inline' 策略：
  // - script-src 'self'：只允许同源脚本（_next/static/ 下的 JS 文件都是同源）
  // - 'unsafe-inline'：允许 Next.js 注入的少量内联脚本（__NEXT_DATA__ 等）
  // - style-src 'unsafe-inline'：CSS-in-JS（Tailwind）需要
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-eval 供 Next.js HMR/动态import使用
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.github.com ws://localhost:* wss://localhost:*",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

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
