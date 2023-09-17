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
      version = "3.9.1"
    }

    null = {
      source  = "hashicorp/null"
      version = "3.1.0"
    }
  }

  required_version = "1.5.7"
}

provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      Environment = terraform.workspace
      Repository  = var.repository
      Service     = var.service
    }
  }
}

provider "cloudflare" {}

provider "null" {}
