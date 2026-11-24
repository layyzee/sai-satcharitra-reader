// Sri Sai Satcharitra - Offline Service Worker
const CACHE_NAME = 'sai-satcharitra-v1.8.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './data/bundle.js',
  './data/chapters.json',
  './data/devotional.json',
  './assets/icon.png',
  './assets/icon-192.png',
  './assets/saibaba.jpg',
  './assets/darshan/01_seated_stone.jpg',
  './assets/darshan/02_satka_baton.jpg',
  './assets/darshan/03_seen_from_back.jpg',
  './assets/darshan/04_chavadi_procession.jpg',
  './assets/darshan/05_chavadi_crown.jpg',
  './assets/darshan/06_with_buti_dixit.jpg',
  './assets/darshan/07_face_prominent.jpg',
  './assets/darshan/08_final_years_1918.jpg'
];

// Install Event - Pre-cache all essential reading assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up outdated caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for Navigation & HTML, Cache-First for static assets
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHtmlNavigation = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHtmlNavigation) {
    // Network-First strategy for HTML: always load latest if online, fall back to cache when offline
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then(cached => cached || caches.match('./index.html'));
      })
    );
    return;
  }

  // Cache-First strategy for images, data, scripts, and stylesheets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
