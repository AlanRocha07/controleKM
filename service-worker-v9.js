const CACHE_NAME='controlekm-v9';
const PRECACHE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nunca cachear Firebase
  if (
    url.origin.includes('firebaseio.com') ||
    url.origin.includes('googleapis.com') ||
    url.pathname.startsWith('/__/')
  ) {
    return event.respondWith(fetch(req));
  }

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        return new Response('<h1>Offline</h1><p>Sem conexão. Tente novamente.</p>', { headers: { 'Content-Type': 'text/html' } });
      }
      throw e;
    }
  })());
});
