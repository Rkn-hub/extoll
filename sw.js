// Enhanced service worker for aggressive image caching
const CACHE_NAME = 'extoll-images-v2';
const SUPABASE_STORAGE_URL = 'https://lnxvkbsbwymmzkyuixgd.supabase.co/storage/v1/object/public/';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Clean up old caches
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only cache Supabase storage requests
    if (event.request.url.startsWith(SUPABASE_STORAGE_URL)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    if (response) {
                        // Return cached version immediately
                        return response;
                    }
                    
                    // Fetch and cache with aggressive caching
                    return fetch(event.request).then((fetchResponse) => {
                        // Only cache successful responses
                        if (fetchResponse.status === 200) {
                            // Clone the response before caching
                            const responseToCache = fetchResponse.clone();
                            cache.put(event.request, responseToCache);
                        }
                        return fetchResponse;
                    }).catch(() => {
                        // Return a minimal fallback for failed requests
                        return new Response('', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
                });
            })
        );
    }
});