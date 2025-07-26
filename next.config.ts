import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev *.sentry.io clerk-telemetry.com;
              connect-src 'self' *.clerk.accounts.dev *.sentry.io clerk-telemetry.com;
              script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob: *.clerk.accounts.dev;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
};

export default nextConfig;
