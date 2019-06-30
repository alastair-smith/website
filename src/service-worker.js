/* eslint-env serviceworker */

const CURRENT_CACHE_NAME = `alsmith.dev-service-worker-1`
const OFFLINE_URL = '/offline.html'

const contentToCache = [
  '/',
  '/styles.css',
  '/offline.html'
]

const cacheResources = async () => {
  const cache = await caches.open(CURRENT_CACHE_NAME)
  return cache.addAll(contentToCache)
}

const getResource = async request => {
  let response
  try {
    const cachedValue = await caches.match(request)
    response = cachedValue || await fetch(request)
  } catch (error) {
    console.error('error', error, request.url)
    response = (
      request.mode === 'navigate' ||
      (
        request.method === 'GET' &&
        request.headers.get('accept').includes('text/html')
      )
    )
      ? await caches.match(OFFLINE_URL)
      : undefined
  }
  return response
}

const deleteOldCaches = async () => {
  const cacheKeys = await caches.keys()
  const oldCacheKeys = cacheKeys.filter(key => key !== CURRENT_CACHE_NAME)
  return Promise.all(oldCacheKeys.map(key => caches.delete(key)))
}

self.addEventListener('install', event =>
  event.waitUntil(cacheResources())
)

self.addEventListener('fetch', event =>
  event.respondWith(getResource(event.request))
)

self.addEventListener('activate', event =>
  event.waitUntil(deleteOldCaches())
)
