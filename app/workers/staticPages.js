addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const defaultContentType = 'application/octet-stream'
const defaultKvType = 'text'
const notFoundPath = '/404.html'

const extensionDetail = {
  '7z': { contentType: 'application/x-7z-compressed', kvType: 'text' },
  aac: { contentType: 'audio/aac', kvType: 'text' },
  abw: { contentType: 'application/x-abiword', kvType: 'text' },
  arc: { contentType: 'application/x-freearc', kvType: 'text' },
  azw: { contentType: 'application/vnd.amazon.ebook', kvType: 'text' },
  bin: { contentType: 'application/octet-stream', kvType: 'arrayBuffer' },
  bmp: { contentType: 'image/bmp', kvType: 'arrayBuffer' },
  bz: { contentType: 'application/x-bzip', kvType: 'text' },
  bz2: { contentType: 'application/x-bzip2', kvType: 'text' },
  cda: { contentType: 'application/x-cdf', kvType: 'text' },
  csh: { contentType: 'application/x-csh', kvType: 'text' },
  css: { contentType: 'text/css', kvType: 'text' },
  csv: { contentType: 'text/csv', kvType: 'text' },
  doc: { contentType: 'application/msword', kvType: 'text' },
  docx: {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    kvType: 'text'
  },
  eot: { contentType: 'application/vnd.ms-fontobject', kvType: 'arrayBuffer' },
  epub: { contentType: 'application/epub+zip', kvType: 'text' },
  gif: { contentType: 'image/gif', kvType: 'arrayBuffer' },
  gz: { contentType: 'application/gzip', kvType: 'text' },
  htm: { contentType: 'text/html', kvType: 'text' },
  html: { contentType: 'text/html', kvType: 'text' },
  ico: { contentType: 'image/vnd.microsoft.icon', kvType: 'arrayBuffer' },
  ics: { contentType: 'text/calendar', kvType: 'text' },
  jar: { contentType: 'application/java-archive', kvType: 'text' },
  jpeg: { contentType: 'image/jpeg', kvType: 'arrayBuffer' },
  jpg: { contentType: 'image/jpeg', kvType: 'arrayBuffer' },
  js: { contentType: 'text/javascript', kvType: 'text' },
  json: { contentType: 'application/json', kvType: 'text' },
  jsonld: { contentType: 'application/ld+json', kvType: 'text' },
  mid: { contentType: 'audio/midi audio/x-midi', kvType: 'text' },
  midi: { contentType: 'audio/midi audio/x-midi', kvType: 'text' },
  mjs: { contentType: 'text/javascript', kvType: 'text' },
  mp3: { contentType: 'audio/mpeg', kvType: 'text' },
  mpkg: {
    contentType: 'application/vnd.apple.installer+xml',
    kvType: 'text'
  },
  odp: {
    contentType: 'application/vnd.oasis.opendocument.presentation',
    kvType: 'text'
  },
  ods: {
    contentType: 'application/vnd.oasis.opendocument.spreadsheet',
    kvType: 'text'
  },
  odt: {
    contentType: 'application/vnd.oasis.opendocument.text',
    kvType: 'text'
  },
  oga: { contentType: 'audio/ogg', kvType: 'text' },
  ogx: { contentType: 'application/ogg', kvType: 'text' },
  opus: { contentType: 'audio/opus', kvType: 'text' },
  otf: { contentType: 'font/otf', kvType: 'arrayBuffer' },
  pdf: { contentType: 'application/pdf', kvType: 'text' },
  php: { contentType: 'application/x-httpd-php', kvType: 'text' },
  png: { contentType: 'image/png', kvType: 'arrayBuffer' },
  ppt: { contentType: 'application/vnd.ms-powerpoint', kvType: 'text' },
  pptx: {
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    kvType: 'text'
  },
  rar: { contentType: 'application/vnd.rar', kvType: 'text' },
  rtf: { contentType: 'application/rtf', kvType: 'text' },
  sh: { contentType: 'application/x-sh', kvType: 'text' },
  svg: { contentType: 'image/svg+xml', kvType: 'text' },
  swf: { contentType: 'application/x-shockwave-flash', kvType: 'text' },
  tar: { contentType: 'application/x-tar', kvType: 'text' },
  tif: { contentType: 'image/tiff', kvType: 'arrayBuffer' },
  tiff: { contentType: 'image/tiff', kvType: 'arrayBuffer' },
  ttf: { contentType: 'font/ttf', kvType: 'arrayBuffer' },
  txt: { contentType: 'text/plain', kvType: 'text' },
  vsd: { contentType: 'application/vnd.visio', kvType: 'text' },
  wav: { contentType: 'audio/wav', kvType: 'text' },
  weba: { contentType: 'audio/webm', kvType: 'text' },
  webmanifest: { contentType: 'application/manifest+json', kvType: 'text' },
  webp: { contentType: 'image/webp', kvType: 'arrayBuffer' },
  woff: { contentType: 'font/woff', kvType: 'arrayBuffer' },
  woff2: { contentType: 'font/woff2', kvType: 'arrayBuffer' },
  xhtml: { contentType: 'application/xhtml+xml', kvType: 'text' },
  xls: { contentType: 'application/vnd.ms-excel', kvType: 'text' },
  xlsx: {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    kvType: 'text'
  },
  xml: { contentType: 'text/xml', kvType: 'text' },
  xul: { contentType: 'application/vnd.mozilla.xul+xml', kvType: 'text' },
  zip: { contentType: 'application/zip', kvType: 'text' }
}

const getPath = url => {
  const rawPath = (new URL(url)).pathname
  return rawPath.includes('.')
    ? rawPath
    : rawPath.endsWith('/')
      ? `${rawPath}index.html`
      : `${rawPath}/index.html`
}

const getExtension = path => path.split('.').slice(-1)[0]

const getContentType = extension => extensionDetail[extension] ? extensionDetail[extension].contentType : defaultContentType

const getKvType = extension => extensionDetail[extension] ? extensionDetail[extension].kvType : defaultKvType

const handleRequest = async request => {
  try {
    const path = getPath(request.url)
    const extension = getExtension(path)
    const value = await STATIC_CONTENT.get(path, { type: getKvType(extension) })
    if (value === null) {
      const errorExtension = getExtension(notFoundPath)
      const errorPage = await STATIC_CONTENT.get(notFoundPath, { type: getKvType(errorExtension) })
      return new Response(
        errorPage,
        {
          status: 404,
          headers: { 'Content-Type': getContentType(errorExtension) }
        }
      )
    } else {
      return new Response(
        value,
        {
          status: 200,
          headers: { 'Content-Type': getContentType(extension) }
        }
      )
    }
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
