const CACHE_NAME='controlekm-v7';
const PRECACHE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',(event)=>{event.waitUntil((async()=>{try{const cache=await caches.open(CACHE_NAME);await cache.addAll(PRECACHE)}finally{self.skipWaiting()}})())});
self.addEventListener('message',(event)=>{if(event.data&&event.data.type==='SKIP_WAITING'){self.skipWaiting()}});
self.addEventListener('activate',(event)=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',(event)=>{const req=event.request;const url=new URL(req.url);if(url.origin.includes('firebaseio.com')||url.origin.includes('googleapis.com')||url.pathname.startsWith('/__/')){event.respondWith(fetch(req));return}
  event.respondWith((async()=>{try{const fresh=await fetch(req);const cache=await caches.open(CACHE_NAME);cache.put(req,fresh.clone());return fresh}catch(e){const cache=await caches.open(CACHE_NAME);const cached=await cache.match(req);if(cached)return cached;if(req.mode==='navigate'){return new Response('<h1>Offline</h1><p>Sem conexão. Tente novamente.</p>',{headers:{'Content-Type':'text/html'}})}throw e}})())});
