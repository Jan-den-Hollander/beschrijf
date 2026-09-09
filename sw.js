// © Jan den Hollander — Service worker voor "Beschrijf"
// Cachet de app-schil (HTML/CSS/JS/fonts) zodat de app na de eerste keer
// laden ook offline start en sneller opent. AI-functies (beoordelen,
// mp3 maken) hebben zelf nog steeds internet nodig — dat blijft zo,
// alleen het openen en bedienen van de app werkt offline.

const CACHE_NAME = 'beschrijf-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate: toon meteen de gecachete versie (snel + offline),
// en ververs de cache op de achtergrond zodra er internet is.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
