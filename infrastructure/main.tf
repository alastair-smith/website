terraform {
  backend "s3" {
    key    = "website.json"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
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

  tags = module.tags.value
  hostname = "${
    terraform.workspace == "prod"
    ? ""
    : "${terraform.workspace}."
  }${var.root_domain}"
  app_directory_path = var.app_directory_path
}
