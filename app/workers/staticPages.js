addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const INCORRECT_METHOD_MESSAGE = 'Method not allowed'
const defaultKvType = 'text'
const notFoundPath = '/404.html'

const defaultHeaders = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin',
  'permissions-policy': 'camera=(), microphone=(), payment=()',
  'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.alsmith.dev",
  'strict-transport-security': 'max-age=31536000; includeSubDomains'
}

const getPath = url => {
  const rawPath = (new URL(url)).pathname
  return rawPath.includes('.')
    ? rawPath
    : rawPath.endsWith('/')
      ? `${rawPath}index.html`
      : `${rawPath}/index.html`
}

const filterMissingHeaders = headers => Object.fromEntries(
  Object.entries(headers)
    .filter(([key, value]) => value !== undefined)
)

const getStaticAssetsResponse = async (path, status = 200) => {
  const kvDetail = (await STATIC_CONTENT.list({ prefix: path }))
    .keys
    .find(({ name }) => name === path)

  if (!kvDetail) return undefined

  const metadata = kvDetail.metadata || {}

  const content = await STATIC_CONTENT.get(path, { type: metadata.kvType || defaultKvType })
  return new Response(
    content,
    {
      status,
      headers: {
        ...defaultHeaders,
        ...filterMissingHeaders({
          'content-type': metadata.contentType,
          etag: metadata.etag,
          'cache-control': metadata.cacheControl
        })
      }
    }
  )
}

const validateRequest = request => {
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: INCORRECT_METHOD_MESSAGE }), { status: 405 })
}

const handleRequest = async request => {
  try {
    const validationError = validateRequest(request)
    if (validationError) return validationError

    const path = getPath(request.url)
    const response = await getStaticAssetsResponse(path) ||
      await getStaticAssetsResponse(notFoundPath)
    return response
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
