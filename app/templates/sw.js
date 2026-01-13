// Dynamically injected version from Flask
const CACHE_VERSION = '{{ cache_version }}';
const CACHE_NAME = 'app-cache-' + CACHE_VERSION;
const DB_FILE = '/app.duckdb';

self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Cleanup Logic: Delete any caches that don't match the current CACHE_NAME
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // We only care about the DB file for this specific logic
    if (event.request.url.includes(DB_FILE)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // Return cached response if found
                    if (response) {
                        console.log('[Service Worker] Serving DB from Cache:', CACHE_NAME);
                        return response;
                    }
                    
                    // Otherwise fetch from network and cache it
                    console.log('[Service Worker] DB not in cache, fetching from server...');
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // Default behavior for other requests
        event.respondWith(fetch(event.request));
    }
});