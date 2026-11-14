// Cada vez que hagas un cambio futuro, sube este número (ej: v11, v12...)
const CACHE_NAME = 'finanzas-v11';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2454/2454269.png'
];

// Se instala y fuerza la activación de inmediato (sin esperar confirmación)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Limpia versiones viejas y toma el control de todos los dispositivos abiertos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// ESTRATEGIA NETWORK-FIRST: Busca siempre lo más nuevo en GitHub primero.
// Si no hay internet, usa la memoria local guardada.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
