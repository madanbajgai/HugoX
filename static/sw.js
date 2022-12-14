const OFFLINE_VERSION = 4;
const CACHE_NAME = "offline";
const assets = [
  "/",
  "manifest.json",
  "/style.css",
  "index.html",
  "fallback.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request).then(function (res) {
            return caches.open("dynamic").then(function (cache) {
              cache.put(event.request.url, res.clone());
              return res;
            });
          });
        }
      })
      .catch(() => caches.match("fallback.html"))
  );
});
