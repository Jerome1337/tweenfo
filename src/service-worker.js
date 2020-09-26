import { timestamp, files, shell } from '@sapper/service-worker';

const ASSETS = `cache${timestamp}`;
const toCache = shell.concat(files);
const cached = new Set(toCache);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(ASSETS)
      .then((cache) => cache.addAll(toCache))
      .then(() => {
        self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== ASSETS) await caches.delete(key);
      }

      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

  const url = new URL(event.request.url);

  // don't try to handle e.g. data: URIs
  if (!url.protocol.startsWith('http')) return;

  // ignore dev server requests
  if (url.hostname === self.location.hostname && url.port !== self.location.port) return;

  // always serve static files and bundler-generated assets from cache
  if (url.host === self.location.host && cached.has(url.pathname)) {
    event.respondWith(caches.match(event.request));
    return;
  }

  if (event.request.cache === 'only-if-cached') return;

  event.respondWith(
    caches.open(`offline${timestamp}`).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        const response = await cache.match(event.request);
        if (response) return response;

        throw err;
      }
    })
  );
});
