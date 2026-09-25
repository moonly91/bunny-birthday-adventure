/* Bunny Birthday Adventure — sw.js
   Offline support when the game is served over https (for example GitHub Pages).
   The first visit caches every file; after that the game opens without internet.
   (Opening index.html straight from disk doesn't need this — it's already offline.) */
const CACHE = 'bunny-birthday-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/core.js',
  'js/data.js',
  'js/state.js',
  'js/audio.js',
  'js/art.js',
  'js/fx.js',
  'js/game.js',
  'js/ui.js',
  'js/dialogue.js',
  'js/characters.js',
  'js/scenes.js',
  'js/garden.js',
  'js/party.js',
  'js/cake.js',
  'js/muffins.js',
  'js/finale.js',
  'js/main.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Answer from the cache straight away (works offline), and refresh the cached copy
// in the background so the next visit picks up any updates.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached || cache.match('index.html'));
      return cached || fresh;
    })
  );
});
