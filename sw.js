const CACHE = "msb-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];


/*
  Neue Service-Worker-Version darf sofort
  die alte Version übernehmen.
*/

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE).then(cache => {

      return cache.addAll(APP_FILES);

    })

  );

  self.skipWaiting();
});


/*
  Alte Cache-Versionen löschen.
*/

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))

      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});


/*
  index.html immer möglichst aktuell
  vom Netzwerk holen.

  Falls kein Internet vorhanden ist,
  wird die gespeicherte Version verwendet.
*/

self.addEventListener("fetch", event => {

  const request = event.request;

  if(request.method !== "GET")
    return;


  const url =
    new URL(
      request.url
    );


  /*
    HTML niemals dauerhaft aus
    einem alten Cache laden.
  */

  if(
    request.mode === "navigate" ||
    url.pathname.endsWith("/index.html")
  ){

    event.respondWith(

      fetch(request, {
        cache:"no-store"
      })

      .then(response => {

        const copy =
          response.clone();

        caches
          .open(CACHE)
          .then(cache => {

            cache.put(
              request,
              copy
            );

          });

        return response;
      })

      .catch(() => {

        return caches.match(request)
          .then(response => {

            return response ||
              caches.match("./index.html");

          });

      })

    );

    return;
  }


  /*
    Für andere Dateien:
    Cache verwenden, ansonsten Netzwerk.
  */

  event.respondWith(

    caches.match(request)
      .then(cached => {

        if(cached)
          return cached;


        return fetch(request)
          .then(response => {

            if(
              response &&
              response.status === 200 &&
              response.type === "basic"
            ){

              const copy =
                response.clone();

              caches
                .open(CACHE)
                .then(cache => {

                  cache.put(
                    request,
                    copy
                  );

                });
            }


            return response;
          });

      })

  );

});
