terraform {
  backend "s3" {
    key    = "website.json"
    region = "eu-west-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.4.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }

  required_version = "0.14.9"
}

provider "aws" {
  region = "eu-west-1"
}

provider "cloudflare" {}

locals {
  hostname = "${
    terraform.workspace == "prod"
    ? ""
    : "${terraform.workspace}."
  }${var.root_domain}"
}

module "aws_tags" {
  source = "./modules/aws_tags"

  environment = terraform.workspace
  repository  = var.repository
  service     = var.service
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

  kelly_function_key = var.kelly_function_key
  kelly_layer_key    = var.kelly_layer_key
  package_bucket     = var.package_bucket
  tags               = module.aws_tags.value
}

module "bort_endpoints" {
  source = "./modules/bort_endpoints"

  tags = module.aws_tags.value
}
