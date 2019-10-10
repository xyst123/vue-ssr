const CacheName = 'v2';
const CacheFiles = [
  '/main',
  '/static/images/favicon.png',
  '/static/js/performance.js',
  'http://statics.itc.cn/spm/prod/js/1.0.1/index.js',
  'http://39d0825d09f05.cdn.sohucs.com/sdk/passport-4.0.6.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CacheName).then(cache => cache.addAll(CacheFiles)),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CacheName) {
            // 清除过期的缓存资源
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener('fetch', (e) => {
  const cacheUrls = [
    '/wrj/v1/show/2019/picAll',
  ];

  const shouldCache = cacheUrls.some(url => new URL(e.request.url).pathname === url);

  if (shouldCache) {
    // 处理接口
    caches.open(CacheName).then(cache => fetch(e.request).then((response) => {
      // 将接口返回结果添加到cache
      cache.put(e.request.url, response.clone());
      return response;
    }));
  } else {
    // 处理静态资源
    // 命中cache则不发起请求直接使用cache，否则发起请求
    e.respondWith(
      caches.match(e.request).then(cache => cache || fetch(e.request)).catch((error) => {
        console.error(error);
        return fetch(e.request);
      }),
    );
  }
});
