var CACHE = 'eng-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  var isPage = e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname === '/manifest.json';
  if (isPage) {
    e.respondWith(fetch(e.request).then(function (res) {
      if (res && res.ok) { var cl = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cl); }); }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (h) { return h || Response.error(); });
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (hit) {
    if (hit) return hit;
    return fetch(e.request).then(function (res) {
      if (res && res.ok && url.pathname.indexOf('/icon-') === 0) {
        var cl = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cl); });
      }
      return res;
    });
  }));
});
