addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const handleRequest = async request => new Response('Hello world')
