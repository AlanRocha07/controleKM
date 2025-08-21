// service-worker.js
const VERSION = "v4-2025-08-20";
const CACHE = "controlekm-" + VERSION;

const toAbs = (p) => new URL(p, self.registration.scope).toString();
const APP_SHELL = [
  "",
  "index.html",
  "manifest.json",
  "admin.html",
  "icon-192.png",
  "icon-512.png"
].map(toAbs);

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : undefined)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(CACHE);
        cache.put(toAbs("index.html"), fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(toAbs("index.html"))) || (await caches.match(APP_SHELL[0]));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const fetchAndUpdate = fetch(event.request).then((resp) => {
      caches.open(CACHE).then((c) => c.put(event.request, resp.clone()));
      return resp;
    }).catch(() => cached);
    return cached || fetchAndUpdate;
  })());
});
