const CACHE_NAME = "mileage-tracker-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/auth.js",
  "/map.js",
  "/tracking.js",
  "/storage.js",
  "/ui.js",
  "/main.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});