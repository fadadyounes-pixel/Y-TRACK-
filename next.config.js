/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve IdeaMap at root: ideamaponline.org == ideamaponline.org/ideamap
      { source: '/', destination: '/ideamap' },
      // Legacy Flask API proxy
      { source: '/api/v1/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
      { source: '/health', destination: 'http://localhost:5000/health' },
    ];
  },
};

module.exports = nextConfig;
