/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Legacy Flask API proxy
      { source: '/api/v1/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
      { source: '/health', destination: 'http://localhost:5000/health' },
    ];
  },
};

module.exports = nextConfig;
