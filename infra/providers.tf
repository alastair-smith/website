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
