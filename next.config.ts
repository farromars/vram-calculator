import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
  // 只缓存真正的静态资源（图片、字体等），不缓存 HTML 页面和 Next.js JS chunks
  // 避免 Service Worker 缓存旧版本导致生产环境内容不可见
  runtimeCaching: [
    {
      // 仅缓存图片资源
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // 仅缓存字体资源
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // TypeScript 类型检查（已修复所有类型错误，启用严格检查）
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 检查（已清理代码，启用构建时检查）
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // 跨域请求配置 — MCP API 工具调用
  // 注意：Access-Control-Allow-Credentials: true 与 Allow-Origin: * 不能同时存在（违反 CORS 规范）
  // 此处仅开放只读/无凭证的跨域请求，不传递 cookie/凭证
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST' },
          { key: 'Access-Control-Allow-Headers', value: 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
