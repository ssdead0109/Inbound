// Inbound PWA Service Worker
const CACHE_NAME = 'inbound-pwa-v1.1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icon-192.png',
  '/wma-icon.png',
];

// 1. Install Event: Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Network-First with Cache Fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API 요청 및 외부 소켓 요청은 캐시하지 않고 항상 네트워크로 통과
  if (url.pathname.startsWith('/api') || event.request.method !== 'GET') {
    return;
  }

  // manifest.json과 sw.js 자체는 절대 캐시하지 않고 항상 최신 네트워크 요청
  if (url.pathname.includes('manifest.json') || url.pathname.includes('sw.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // HTML 네비게이션 요청: 네트워크 우선 -> 실패 시 캐시된 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 정적 리소스(JS, CSS, 이미지): Stale-While-Revalidate (캐시 즉시 반환 + 백그라운드 갱신)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // 오프라인 상태에서 네트워크 실패 시 무시
      });

      return cachedResponse || fetchPromise;
    })
  );
});
