addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const INCORRECT_METHOD_MESSAGE = 'Method not allowed'

const headersToAdd = [
  ['x-frame-options', 'DENY'],
  ['x-content-type-options', 'nosniff'],
  ['referrer-policy', 'strict-origin'],
  ['permissions-policy', 'camera=(), microphone=(), payment=()'],
  [
    'content-security-policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.alsmith.dev"
  ],
  [
    'strict-transport-security',
    'max-age=31536000; includeSubDomains'
  ]
]

const headersToRemove = [
  'apigw-requestid'
]

const getResponseWithUpdatedHeaders = (originalResponse, headersToAdd, headersToRemove) => {
  const response = new Response(originalResponse.body, originalResponse)

  // Add headers
  headersToAdd.forEach(([header, value]) => response.headers.append(header, value))

  // Delete headers
  headersToRemove.forEach(header => response.headers.delete(header))

  // Adjust the value for an existing header
  response.headers.set('x-header-to-change', 'NewValue')

  return response
}

const validateRequest = request => {
  const validMethods = ['GET', 'POST']
  if (!validMethods.includes(request.method)) return new Response(JSON.stringify({ error: INCORRECT_METHOD_MESSAGE }), { status: 405 })
}

const handleRequest = async request => {
  try {
    const validationError = validateRequest(request)
    if (validationError) return validationError

    const response = await fetch(BORT_API_URL, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    const newResponse = getResponseWithUpdatedHeaders(response, headersToAdd, headersToRemove)

    return newResponse
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
