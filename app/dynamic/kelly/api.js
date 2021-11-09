addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const handleRequest = async request => {
  const publicUrl = new URL(request.url)

  return fetch(`${KELLY_API_URL}/${publicUrl.search}`)
}
