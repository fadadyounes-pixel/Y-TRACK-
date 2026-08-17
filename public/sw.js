// IdeaMap Service Worker — offline-first shell for PWA
// Cache version: bump this string to force all clients to refresh their cache
const CACHE = 'ideamap-v1';

// App shell — files that must be available for offline use
const SHELL = [
  '/ideamap',
  '/manifest.json',
  '/logo-transparent.png',
];

// ── Install: pre-cache the shell ──────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .catch(() => {}) // don't block install if a shell asset is unreachable
  );
  self.skipWaiting();
});

// ── Activate: purge stale caches from old SW versions ─
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: runtime caching strategy ──────────────────
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API calls: network-only — don't cache, let app handle errors via toast
  if (url.pathname.startsWith('/api/')) return;

  // Navigation (full page): network-first, fall back to cached shell.
  // A bare fetch() here has no ceiling on mobile networks where a request can
  // stall without ever erroring or completing — the .catch() fallback below
  // would then never run, leaving the page blank and "loading" indefinitely.
  // Bounding the fetch with a timeout guarantees the fallback is always reached.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request, { signal: AbortSignal.timeout(10000) })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request) ||
          caches.match('/ideamap') ||
          new Response('IdeaMap — hors ligne / offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          })
        )
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): stale-while-revalidate
  // Serve from cache immediately, refresh in background. Same stall risk as
  // above when there's no cached copy yet (first load) — bound it too so an
  // uncached asset request can't hang forever on a bad connection.
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(request).then(cached => {
        const network = fetch(request, { signal: AbortSignal.timeout(8000) }).then(res => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
