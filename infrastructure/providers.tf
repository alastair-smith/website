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

  required_version = "0.14.9"
}

provider "aws" {
  region = "eu-west-1"
}

provider "cloudflare" {}

provider "null" {}
