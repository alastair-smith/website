addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const handleRequest = async request => {
  const publicUrl = new URL(request.url)

  return fetch(`${process.env.API_GATEWAY_URL}${publicUrl.search}`)
}
