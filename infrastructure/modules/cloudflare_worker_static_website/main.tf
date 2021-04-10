terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }
}

resource "cloudflare_workers_kv_namespace" "static_content" {
  title = "${var.hostname}/static-content"
}

resource "null_resource" "kv_static_content" {
  for_each = fileset(var.app_directory_path, "**")

  triggers = {
    key          = "%2F${each.key}"
    namespace_id = cloudflare_workers_kv_namespace.static_content.id

    metadata = replace(jsonencode(merge(
      local.metadata_by_file_extension[basename(replace(each.key, ".", "/"))],
      { etag = filemd5("${var.app_directory_path}/${each.key}") }
    )), "\"", "\\\"")
  }

  provisioner "local-exec" {
    command = "${path.module}/write-file-to-kv.sh --file-path '${var.app_directory_path}/${each.key}' --key '${self.triggers.key}' --metadata '${self.triggers.metadata}' --namespace '${self.triggers.namespace_id}'"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "${path.module}/delete-file-from-kv.sh --key '${self.triggers.key}' --namespace '${self.triggers.namespace_id}'"
  }
}

resource "cloudflare_worker_script" "static_content_handler" {
  name    = "static-content"
  content = file(var.worker_path)

  kv_namespace_binding {
    name         = "STATIC_CONTENT"
    namespace_id = cloudflare_workers_kv_namespace.static_content.id
  }
}

resource "cloudflare_worker_route" "default_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.hostname}/*"
  script_name = cloudflare_worker_script.static_content_handler.name
}
