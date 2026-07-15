/** @type {import('next').NextConfig} */

// ─────────────────────────────────────────────────────────────────────────────
// ROUTING SAFETY RULE — DO NOT REMOVE OR MODIFY THIS COMMENT
//
// This repo hosts TWO separate apps on ONE Next.js instance:
//   • TalentMap  →  talentmaponline.org   root route "/"  (app/page.tsx)
//   • IdeaMap    →  ideamaponline.org     sub-route "/ideamap" (app/ideamap/page.tsx)
//
// NEVER add a rewrite / redirect of  source:"/"  destination:"/ideamap"
// (or any other destination) — it breaks TalentMap's home page entirely.
//
// IdeaMap is accessible at /ideamap.  That is its permanent, correct URL.
// ─────────────────────────────────────────────────────────────────────────────

const nextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",          value: "SAMEORIGIN" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(self), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",   value: "on" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // Legacy Flask API proxy
      { source: '/api/v1/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
      { source: '/health', destination: 'http://localhost:5000/health' },
      // ⚠️  DO NOT add  { source: '/', destination: '/ideamap' }  here.
      //    See safety comment above.
    ];
  },
};

module.exports = nextConfig;
