/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure API rewrites to proxy backend requests
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*', // Proxy to Flask backend
      },
      {
        source: '/health',
        destination: 'http://localhost:5000/health',
      },
    ];
  },
};

module.exports = nextConfig;
