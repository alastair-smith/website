terraform {
  backend "s3" {
    key    = "website.json"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
}

locals {
  tags = {}
}
