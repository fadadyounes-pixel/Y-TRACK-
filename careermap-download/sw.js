const CACHE = 'careermap-v65';
const PRECACHE = ['/lib/react.js', '/lib/react-dom.js', '/lib/babel.js'];

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always fetch the HTML page fresh — never serve from cache
  if (e.request.mode === 'navigate' || e.request.url.endsWith('/') || e.request.url.endsWith('/index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
  // Other assets: network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res; })
      .catch(() => caches.match(e.request))
  );
});
