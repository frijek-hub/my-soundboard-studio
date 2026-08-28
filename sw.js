const CACHE = "msb-v2";

const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))

  );

  /* Neue Version sofort aktivieren */
  self.skipWaiting();

});


/* =========================================================
   AKTIVIEREN
   Alte Caches löschen
========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================================================
   DATEIEN LADEN
========================================================= */

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);

      })

  );

});
