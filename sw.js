const CACHE_NAME = 'hisab-manager-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './dashboard.html',
    './history.html',
    './profile.html',
    './css/base.css',
    './css/login.css',
    './css/navbar.css',
    './css/dashboard.css',
    './css/history.css',
    './css/profile.css',
    './js/config.js',
    './js/auth.js',
    './js/dashboard.js',
    './js/history.js',
    './js/profile.js',
    'https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
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
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
