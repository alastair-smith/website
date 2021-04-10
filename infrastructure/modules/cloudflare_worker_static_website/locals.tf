
locals {
  cacheControl = {
    noCache = "no-cache"
    cache   = "public, max-age=31536000, immutable"
  }
  kvType = {
    text        = "text"
    arrayBuffer = "arrayBuffer"
  }
  metadata_by_file_extension = {
    css = {
      contentType  = "text/css"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    eot = {
      contentType  = "application/vnd.ms-fontobject"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    gif = {
      contentType  = "image/gif"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    html = {
      contentType  = "text/html"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.noCache
    }
    ico = {
      contentType  = "image/vnd.microsoft.icon"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    jpeg = {
      contentType  = "image/jpeg"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    jpg = {
      contentType  = "image/jpeg"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    js = {
      contentType  = "text/javascript"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    json = {
      contentType  = "application/json"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    mjs = {
      contentType  = "text/javascript"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    otf = {
      contentType  = "font/otf"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    png = {
      contentType  = "image/png"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    svg = {
      contentType  = "image/svg+xml"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    ttf = {
      contentType  = "font/ttf"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    txt = {
      contentType  = "text/plain"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    webmanifest = {
      contentType  = "application/manifest+json"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
    webp = {
      contentType  = "image/webp"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    woff = {
      contentType  = "font/woff"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    woff2 = {
      contentType  = "font/woff2"
      kvType       = local.kvType.arrayBuffer
      cacheControl = local.cacheControl.cache
    }
    xml = {
      contentType  = "text/xml"
      kvType       = local.kvType.text
      cacheControl = local.cacheControl.cache
    }
  }
}
