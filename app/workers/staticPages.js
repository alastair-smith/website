addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const defaultContentType = 'application/octet-stream'

const contentTypes = {
  '7z': 'application/x-7z-compressed',
  aac: 'audio/aac',
  abw: 'application/x-abiword',
  arc: 'application/x-freearc',
  avi: 'video/x-msvideo',
  azw: 'application/vnd.amazon.ebook',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  bz: 'application/x-bzip',
  bz2: 'application/x-bzip2',
  cda: 'application/x-cdf',
  csh: 'application/x-csh',
  css: 'text/css',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  eot: 'application/vnd.ms-fontobject',
  epub: 'application/epub+zip',
  gif: 'image/gif',
  gz: 'application/gzip',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/vnd.microsoft.icon',
  ics: 'text/calendar',
  jar: 'application/java-archive',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  jsonld: 'application/ld+json',
  mid: 'audio/midi audio/x-midi',
  midi: 'audio/midi audio/x-midi',
  mjs: 'text/javascript',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  mpkg: 'application/vnd.apple.installer+xml',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  oga: 'audio/ogg',
  ogv: 'video/ogg',
  ogx: 'application/ogg',
  opus: 'audio/opus',
  otf: 'font/otf',
  pdf: 'application/pdf',
  php: 'application/x-httpd-php',
  png: 'image/png',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  rar: 'application/vnd.rar',
  rtf: 'application/rtf',
  sh: 'application/x-sh',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  tar: 'application/x-tar',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ts: 'video/mp2t',
  ttf: 'font/ttf',
  txt: 'text/plain',
  vsd: 'application/vnd.visio',
  wav: 'audio/wav',
  weba: 'audio/webm',
  webmanifest: 'application/manifest+json',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xhtml: 'application/xhtml+xml',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: 'text/xml',
  xul: 'application/vnd.mozilla.xul+xml',
  zip: 'application/zip'
}

const getPath = url => {
  const rawPath = (new URL(url)).pathname
  return rawPath.includes('.')
    ? rawPath
    : rawPath.endsWith('/')
      ? `${rawPath}index.html`
      : `${rawPath}/index.html`
}

const getContentType = path => {
  const extension = path.split('.').slice(-1)[0]
  return contentTypes[extension] || defaultContentType
}

const handleRequest = async request => {
  try {
    const path = getPath(request.url)
    const value = await STATIC_CONTENT.get(path)
    if (value === null) {
      const notFoundPath = '/404.html'
      const errorPage = await STATIC_CONTENT.get(notFoundPath)
      return new Response(
        errorPage,
        {
          status: 404,
          headers: { 'Content-Type': getContentType(notFoundPath) }
        }
      )
    } else {
      return new Response(
        value,
        {
          status: 200,
          headers: { 'Content-Type': getContentType(path) }
        }
      )
    }
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
