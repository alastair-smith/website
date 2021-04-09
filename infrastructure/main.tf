terraform {
  backend "s3" {
    key    = "website.json"
    region = "eu-west-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }
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

  build       = var.build
  commit      = var.commit
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

module "cloudflare_worker_static_website" {
  source = "./modules/cloudflare_worker_static_website"

  app_directory_path = var.app_directory_path
  cloudflare_zone_id = data.cloudflare_zones.website.zones[0].id
  hostname           = local.hostname
  worker_path        = "${var.cloudflare_worker_scripts}/staticPages.js"
}
