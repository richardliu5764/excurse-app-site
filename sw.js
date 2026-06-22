/* Excurse offline-first service worker. The app is local-first: once opened online, the shell (HTML,
   hashed JS/CSS, fonts, icons, the lazily-loaded map engine) is cached so a cold relaunch works with no
   network. Trip bundles (*.enc) are network-first so an updated plan lands, falling back to the cached
   ciphertext offline. Only same-origin GETs are cached; map tiles and other cross-origin requests pass
   through untouched. Bump CACHE to retire the previous generation wholesale. */
const CACHE = "excurse-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                 // tiles, fonts CDNs, etc. — never cache
  e.respondWith(url.pathname.endsWith(".enc") ? networkFirst(req) : cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
    return res;
  } catch (err) {
    if (req.mode === "navigate") {
      const shell = (await caches.match("/")) || (await caches.match("/index.html"));
      if (shell) return shell;
    }
    throw err;
  }
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}
