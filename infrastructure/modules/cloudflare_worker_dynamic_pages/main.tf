terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }
}

locals {
  dynamic_pages = fileset(var.dynamic_app_directory_path, "**")
}

resource "cloudflare_worker_script" "dynamic_content_handler" {
  for_each = local.dynamic_pages

  name    = replace(replace("${var.hostname}-dynamic/${each.value}", ".", "-"), "/", "_")
  content = file("${var.dynamic_app_directory_path}/${each.value}")

  dynamic "plain_text_binding" {
    for_each = var.environment_variables

    content {
      name = plain_text_binding.key
      text = plain_text_binding.value
    }
  }
}

resource "cloudflare_worker_route" "default_route" {
  for_each = local.dynamic_pages

  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.hostname}/${trimsuffix(each.value, ".js")}*"
  script_name = cloudflare_worker_script.dynamic_content_handler[each.value].name

  depends_on = [
    cloudflare_worker_script.dynamic_content_handler
  ]
}
