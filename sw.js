// Service Worker básico para cache de recursos estáticos
const CACHE_NAME = 'carmen-barquero-v1';
const STATIC_CACHE = [
  '/',
  '/css/base.css',
  '/css/layout.css',
  '/css/menu-superior.css', 
  '/css/fonts.css',
  '/img/home.jpeg',
  '/img/home.webp',
  '/img/carmen-barquero-psicologa-op.webp',
  '/img/carmen-barquero-psicologa-op.jpg',
  '/fonts/caviar_dreams/CaviarDreams.woff2',
  '/fonts/chetta-vissto/ChettaVissto.woff2',
  '/js/performance-loader.js',
  '/js/menu-responsive.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE);
      })
      .catch((error) => {
        console.log('SW Install failed:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia cache-first para recursos estáticos
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }

        // Si no está en cache, fetch y cachear
        return fetch(event.request)
          .then((response) => {
            // Verificar que la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar para cachear
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});