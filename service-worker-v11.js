// service-worker-v11.js
const CACHE_NAME = 'controlekm-v11-' + Date.now(); // força atualização ao publicar
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js'
];

// Instalação do SW e cache inicial
self.addEventListener('install', event => {
  console.log('[SW] Instalando nova versão...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos iniciais');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  console.log('[SW] Ativando nova versão...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Removendo cache antigo:', key);
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia de busca: Network First com fallback para cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
