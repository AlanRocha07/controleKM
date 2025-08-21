
const CACHE_NAME = 'controlekm-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
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
  // Evita cache para chamadas dinâmicas do Firebase/Firestore/Auth
  const url = new URL(req.url);
  if (url.origin.includes('firebaseio.com') || url.origin.includes('googleapis.com')) {
    event.respondWith(fetch(req));
    return;
  }

  // Network-first para HTML/CSS/JS, com fallback para cache
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
      // fallback básico
      if (req.mode === 'navigate') {
        return new Response('<h1>Offline</h1><p>Sem conexão. Tente novamente.</p>', { headers: { 'Content-Type': 'text/html' }});
      }
      throw e;
    }
  })());
});
