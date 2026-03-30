const CACHE_NAME = 'hisab-manager-v36';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './dashboard.html',
    './history.html',
    './profile.html',
    './box.html',
    './secret_history.html',
    './counter_history.html',
    './expenses.html',
    './manifest.json',
    './css/base.css',
    './css/login.css',
    './css/navbar.css',
    './css/dashboard.css',
    './css/history.css',
    './css/profile.css',
    './css/box.css',
    './css/secret_history.css',
    './css/expenses.css',
    './js/config.js',
    './js/auth.js',
    './js/dashboard.js',
    './js/history.js',
    './js/profile.js',
    './js/box.js',
    './js/secret_history.js',
    './js/expenses.js',
    './js/share-image.js',
    './js/pwa.js',
    './js/notification-helper.js',
    'https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css',
    'https://cdn-icons-png.flaticon.com/512/18062/18062856.png',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching Files');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.error('Service Worker: Cache Error', err))
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Deleting Old Cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip caching for non-GET requests and Supabase API calls
    if (event.request.method !== 'GET' || url.hostname.includes('supabase.co')) {
        return;
    }

    const isStaticAsset = ASSETS_TO_CACHE.some(asset => {
        if (asset === './') return url.pathname === '/' || url.pathname.endsWith('/index.html');
        return event.request.url.includes(asset.replace('./', ''));
    });

    if (isStaticAsset) {
        // Cache-First Strategy for static assets
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    });
                })
        );
    } else {
        // Network-First Strategy for dynamic content
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    }
});
