const CACHE_NAME = 'hisab-manager-v15';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './dashboard.html',
    './history.html',
    './profile.html',
    './box.html',
    './secret_history.html',
    './counter_history.html',
    './css/base.css',
    './css/login.css',
    './css/navbar.css',
    './css/dashboard.css',
    './css/history.css',
    './css/profile.css',
    './css/box.css',
    './css/secret_history.css',
    './js/config.js',
    './js/auth.js',
    './js/dashboard.js',
    './js/history.js',
    './js/profile.js',
    './js/box.js',
    './js/secret_history.js',
    './js/share-image.js',
    './js/pwa.js',
    'https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach(client => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
