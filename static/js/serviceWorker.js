const FileCacheName = 'file-v1';
const ApiCacheName = 'api-v1';

const cacheFiles = [
  '/main',
  '/manifest.json',
  '/static/images/favicon.png',
  '/static/js/performance.js',
  'http://statics.itc.cn/spm/prod/js/1.0.1/index.js',
  'http://39d0825d09f05.cdn.sohucs.com/sdk/passport-4.0.6.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(FileCacheName).then(cache => cache.addAll(cacheFiles)),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => {
          if ((cacheName.startsWith('file-') && cacheName !== FileCacheName) || (cacheName.startsWith('api-') && cacheName !== ApiCacheName)) {
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
    caches.open(ApiCacheName).then(cache => fetch(e.request).then((response) => {
      // 将接口返回结果添加到cache
      cache.put(e.request.url, response.clone());
      return response;
    }));
  } else {
    // 处理静态资源
    // 命中cache则不发起请求直接使用cache，否则发起请求
    e.respondWith(
      caches.match(e.request).then(cache => cache || fetch(e.request)).catch(() => {
        if (/\.png|jpeg|jpg|gif/i.test(e.request.url)) {
          return caches.match('/static/images/favicon.png').then(cache => cache);
        }
      }),
    );
  }
});

self.addEventListener('push', (e) => {
  const { data } = e;
  if (data) {
    const realData = JSON.parse(data.text());
    self.registration.showNotification(realData.title, realData.options);
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const { action } = e;
  e.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (!clients || clients.length === 0) {
        // 如果页面没打开则打开页面
        if (self.clients.openWindow) {
          self.clients.openWindow('http://127.0.0.1:3350/main');
        }
        return;
      }
      // 如果页面已打开则切换到页面
      if (clients[0].focus) {
        clients[0].focus();
      }
      clients.forEach((client) => {
        client.postMessage(action);
      });
    }),
  );
});

class EventController {
  constructor() {
    this.listeners = {};
  }

  once(tag, callback) {
    this.listeners[tag] = this.listeners[tag] || [];
    this.listeners[tag].push(callback);
  }

  trigger(tag, data) {
    this.listeners[tag] = this.listeners[tag] || [];
    let listener;
    while (listener = this.listeners[tag].shift()) {
      listener(data);
    }
  }
}

const eventController = new EventController();

self.addEventListener('sync', (e) => {
  if (e.tag === 'record-sync') {
    const callbackPromise = new Promise((resolve) => {
      eventController.once('record', (data) => {
        resolve(data);
      });
      setTimeout(resolve, 15000);
    });
    e.waitUntil(
      callbackPromise.then((data) => {
        const ua = data && data.ua ? data.ua : '';
        const request = new Request(`/sync/record?ua=${ua}`, { method: 'GET' });
        return fetch(request);
      }).then(response => response),
    );
  }
});

self.addEventListener('message', (e) => {
  const realData = JSON.parse(e.data);
  const { type, data } = realData;
  eventController.trigger(type, data);
});
