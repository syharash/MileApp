const CACHE_NAME = "MileApp-v2"; // ✅ Bump version to force refresh
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/auth.js",
  "/map.js",
  "/tracking.js",
  "/storage.js",
  "/ui.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/main.js"
];

// ✅ Install: Cache fresh files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ✅ Activate: Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// ✅ Fetch: Serve from cache, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
