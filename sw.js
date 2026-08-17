// Department of Prompt Health · Offline continuity plan.
// This intervention is available offline. Claude is not.
const CACHE_NAME = "claudeholic-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./assets/css/site.css",
  "./assets/js/achievements.js",
  "./assets/js/assessment-model.js",
  "./assets/js/assessment.js",
  "./assets/js/census.js",
  "./assets/js/condition.js",
  "./assets/js/exam-model.js",
  "./assets/js/exam.js",
  "./assets/js/field-notes.js",
  "./assets/js/history.js",
  "./assets/js/inspection-model.js",
  "./assets/js/inspection.js",
  "./assets/js/palette.js",
  "./assets/js/panic.js",
  "./assets/js/recovery.js",
  "./assets/js/report.js",
  "./assets/js/site.js",
  "./assets/js/terminal.js",
  "./assets/fonts/newsreader-latin.woff2",
  "./assets/fonts/ibm-plex-mono-400-latin.woff2",
  "./assets/fonts/ibm-plex-mono-500-latin.woff2",
  "./assets/fonts/ibm-plex-mono-600-latin.woff2",
  "./assets/images/favicon.svg",
  "./assets/images/department-seal.svg",
  "./bulletins/",
  "./field-notes/",
  "./data/census.json",
  "./data/field-notes.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // The census ledger prefers freshness; everything else prefers existence.
  if (request.url.endsWith("/data/census.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }

            return response;
          })
          .catch(() => (request.mode === "navigate" ? caches.match("./index.html") : Promise.reject(new Error("Offline, and the requested paperwork was never filed locally.")))),
    ),
  );
});
