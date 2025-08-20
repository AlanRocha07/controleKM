const CACHE_NAME = "controlekm-v3";
const OFFLINE_URLS = [
  "/",              // Página inicial
  "/index.html",
  "/manifest.json",
  "/service-worker.js",
  "/icon-192.png",
  "/icon-512.png",
  "/admin.html"
];

// Instala e faz cache inicial
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

// Busca recursos com fallback para cache/offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Atualiza cache com a versão mais nova
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Se falhar (offline), tenta pegar do cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Caso o arquivo não esteja no cache, devolve a página inicial
          return caches.match("/index.html");
        });
      })
  );
});
