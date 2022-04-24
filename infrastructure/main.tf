locals {
  hostname = "${
    terraform.workspace == "prod"
    ? ""
    : "${terraform.workspace}."
  }${var.root_domain}"
}

data "cloudflare_zones" "website" {
  filter {
    name = var.root_domain
  }
}

resource "cloudflare_record" "website" {
  name    = local.hostname
  proxied = true
  type    = "AAAA"
  value   = "100::" # ipv6 blackhole
  zone_id = data.cloudflare_zones.website.zones[0].id
}

module "cloudflare_worker_static_pages" {
  source = "./modules/cloudflare_worker_static_pages"

  cloudflare_zone_id        = data.cloudflare_zones.website.zones[0].id
  hostname                  = local.hostname
  static_app_directory_path = var.static_app_directory_path
  worker_path               = "${var.cloudflare_worker_scripts}/staticPages.js"
}

module "cloudflare_worker_dynamic_pages" {
  source = "./modules/cloudflare_worker_dynamic_pages"

  cloudflare_zone_id         = data.cloudflare_zones.website.zones[0].id
  dynamic_app_directory_path = var.dynamic_app_directory_path
  hostname                   = local.hostname

  environment_variables = {
    BORT_API_URL  = module.bort_endpoints.url
    KELLY_API_URL = module.kelly_endpoint.url
  }
}

module "kelly_endpoint" {
  source = "./modules/kelly_endpoint"

  kelly_function_key    = var.kelly_function_key
  kelly_layer_key       = var.kelly_layer_key
  log_retention_in_days = var.log_retention_in_days
  package_bucket        = var.package_bucket
}

module "bort_endpoints" {
  source = "./modules/bort_endpoints"
}
