const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v3';
const assets = [
  '/',
  '/index.html',
  '/js/main.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html',
  '/manifest.json'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 0);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/pages/fallback.html');
        } 
      })
    );
  }
});





//Manifest Icon Stuff

// "icons": [
//   {
//     "src": "/img/icons/icon-72x72.png",
//     "type": "image/png",
//     "sizes": "72x72"
//   },
//   {
//     "src": "/img/icons/icon-96x96.png",
//     "type": "image/png",
//     "sizes": "96x96"
//   },
//   {
//     "src": "/img/icons/icon-128x128.png",
//     "type": "image/png",
//     "sizes": "128x128"
//   },
//   {
//     "src": "/img/icons/icon-144x144.png",
//     "type": "image/png",
//     "sizes": "144x144"
//   },
//   {
//     "src": "/img/icons/icon-152x152.png",
//     "type": "image/png",
//     "sizes": "152x152"
//   },
//   {
//     "src": "/img/icons/icon-192x192.png",
//     "type": "image/png",
//     "sizes": "192x192"
//   },
//   {
//     "src": "/img/icons/icon-384x384.png",
//     "type": "image/png",
//     "sizes": "384x384"
//   },
//   {
//     "src": "/img/icons/icon-512x512.png",
//     "type": "image/png",
//     "sizes": "512x512"
//   }

// ]