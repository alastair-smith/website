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

module "tags" {
  source = "./modules/tags"

  build       = var.build
  commit      = var.commit
  environment = terraform.workspace
  repository  = var.repository
  service     = var.service
}

module "s3_static_website" {
  source = "./modules/s3_static_website"

  tags               = module.tags.value
  hostname           = local.hostname
  app_directory_path = var.app_directory_path
}

data "cloudflare_zones" "website" {
  filter {
    name = var.root_domain
  }
}

resource "cloudflare_record" "website" {
  name    = local.hostname
  proxied = true
  type    = "CNAME"
  value   = module.s3_static_website.domain
  zone_id = data.cloudflare_zones.website
}
