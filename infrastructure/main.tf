terraform {
  backend "s3" {
    key    = "website"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
}

locals {
  tags {
    "Created By"     = "Terraform"
    "Git Branch"     = "${var.git_branch}"
    "Git Commit"     = "${var.git_commit}"
    "Git Repository" = "${var.git_repository}"
    Environment      = "${var.environment}"
    Project          = "website"
  }
}

resource "aws_s3_bucket" "website_bucket" {
  acl           = "private"
  bucket_prefix = "${var.dns_name}.${var.environment}"
  tags          = "${merge(map("Name", "website"), local.tags)}"
}
