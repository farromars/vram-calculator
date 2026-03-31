import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 86400, // 1 day
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

  // 允许跨域请求（开发环境）
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
