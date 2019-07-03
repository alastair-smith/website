/* eslint-env serviceworker */

const LATEST_CACHE_NAME = 'general-service-worker-v2'
const OLD_CONTENT_CACHE_NAME = 'backup-cache-v2'
const OFFLINE_URL = '/offline.html'

const mandatoryCacheList = [
  '/',
  '/styles.css',
  '/offline.html',
  '/custom-components/standard-page-wrapper.js'
]

const optionalCacheList = [
  '/assets/images/alastair.260px.jpg',
  '/assets/images/alastair.260px.webp',
  '/assets/images/alastair.343px.jpg',
  '/assets/images/alastair.343px.webp',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/browserconfig.xml',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon.ico',
  '/mstile-150x150.png',
  '/safari-pinned-tab.svg',
  '/site.webmanifest'
]

const addMandatoryItemsToCache = async () => {
  const cache = await caches.open(LATEST_CACHE_NAME)
  return cache.addAll(mandatoryCacheList)
}

const getFromLatestCache = async request => {
  const cache = await caches.open(LATEST_CACHE_NAME)
  return cache.match(request)
}

const getFromOldCache = async request => {
  const cache = await caches.open(OLD_CONTENT_CACHE_NAME)
  return cache.match(request)
}

const addToNewCache = async request => {
  try {
    const latestCache = await caches.open(LATEST_CACHE_NAME)
    await latestCache.add(request)
  } catch (error) {
    console.log(`Failed to update new cache in background for ${request.url}`)
  }
}

const updateCacheInBackground = getFromCache => async request => {
  const response = await getFromCache(request)
  if (response) addToNewCache(request)
  return response
}

const fetchAndUpdateCache = async request => {
  const cache = await caches.open(LATEST_CACHE_NAME)
  const response = await fetch(request)
  cache.put(request, response.clone())
  return response
}

const isImage = request =>
  request.url.endsWith('.png') ||
  request.url.endsWith('.jpg') ||
  request.url.endsWith('.webp')

const getImageSize = key => Number(key.url.split('.')[-2].split('x')[0])

const getBiggestImageFromCache = async (
  cacheName,
  requestedImageName,
  requestedFileType
) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  const alternativeImages = keys.filter(key => {
    const pathSections = (new URL(key.url)).pathname.split('.')
    const imageName = pathSections.slice(0, -2).join('.')
    const fileType = pathSections[-1]

    return imageName === requestedImageName && fileType === requestedFileType
  })
  const biggestImage = alternativeImages
    .sort((keyA, keyB) => getImageSize(keyB) - getImageSize(keyA))[0]
  return biggestImage ? cache.match(biggestImage) : undefined
}

const getAlternativeImage = async request => {
  const path = (new URL(request.url)).pathname
  const pathSections = path.split('.')
  const imageName = pathSections.slice(0, -2).join('.')
  const fileType = pathSections[-1]

  return getBiggestImageFromCache(LATEST_CACHE_NAME, imageName, fileType) ||
    getBiggestImageFromCache(OLD_CONTENT_CACHE_NAME, imageName, fileType)
}

const getResource = async request => {
  let response
  try {
    response = await getFromLatestCache(request) ||
    (isImage(request) && await updateCacheInBackground(getAlternativeImage)(request)) ||
      await updateCacheInBackground(getFromOldCache)(request) ||
      await fetchAndUpdateCache(request)
  } catch (error) {
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
  // backup most recent versions of optional content
  const oldContentCache = await caches.open(OLD_CONTENT_CACHE_NAME)
  await Promise.all(
    optionalCacheList
      .map(async request => {
        const latestResponse = await caches.match(request)
        if (latestResponse) await oldContentCache.put(request, latestResponse)
      }))

  // delete old caches
  await Promise.all(
    (await caches.keys())
      .filter(key =>
        key !== LATEST_CACHE_NAME &
        key !== OLD_CONTENT_CACHE_NAME
      )
      .map(key => caches.delete(key))
  )
}

self.addEventListener('install', event =>
  event.waitUntil(addMandatoryItemsToCache())
)

self.addEventListener('fetch', event =>
  event.respondWith(getResource(event.request))
)

self.addEventListener('activate', event =>
  event.waitUntil(deleteOldCaches())
)
