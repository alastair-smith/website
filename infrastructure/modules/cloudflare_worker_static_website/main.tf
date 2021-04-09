resource "cloudflare_workers_kv_namespace" "static_content" {
  title = "${var.hostname}/static-content"
}

resource "cloudflare_workers_kv" "static_content" {
  for_each = fileset(var.app_directory_path, "**")

  namespace_id = cloudflare_workers_kv_namespace.static_pages.id
  key          = each.key
  value        = file("${var.app_directory_path}/${each.key}")
}

resource "cloudflare_worker_script" "static_content_handler" {
  name    = "${var.hostname}/static-content"
  content = file(var.worker_path)

  kv_namespace_binding {
    name         = "STATIC_CONTENT"
    namespace_id = cloudflare_workers_kv_namespace.static_content.id
  }
}

resource "cloudflare_worker_route" "default_route" {
  zone_id     = var.zone_id
  pattern     = "${var.hostname}/*"
  script_name = cloudflare_worker_script.static_content_handler.name
}