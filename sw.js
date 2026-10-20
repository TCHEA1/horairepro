// HorairePro — service worker : l'application fonctionne hors connexion.
const VERSION = "horairepro-v1.4.0";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "vendor/jspdf.umd.min.js",
  "vendor/jspdf.plugin.autotable.min.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Polices Google : mises en cache au premier passage
  if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(
      caches.open(VERSION).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit))
      )
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  // Fichiers : cache d'abord
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
