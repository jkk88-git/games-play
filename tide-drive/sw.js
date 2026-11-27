// 물길 드라이브 서비스 워커 (빌드 때 자동 생성, 버전 48871ccbf4bb)
const CACHE = 'tide-drive-48871ccbf4bb';
const FILES = ["./","assets/index.js","index.html","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","manifest.webmanifest"];

self.addEventListener('install', (event) => {
  // HTTP 캐시를 거치지 않고 새로 받아 둔다 (배포 직후 옛 파일이 섞이지 않게)
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('tide-drive-') && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // ignoreVary: 서버가 Vary: Origin 등을 붙여도 받아 둔 파일과 맞춘다 (모듈 스크립트 요청에는 Origin이 붙는다)
      const hit = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      if (request.mode === 'navigate') {
        const page = await cache.match('./', { ignoreVary: true });
        if (page) return page;
      }
      return fetch(request);
    }),
  );
});
