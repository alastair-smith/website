terraform {
  backend "s3" {
    key    = "website"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
}

data "external" "website_files" {
  program = ["sh", "./get-website-files.sh"]
}

locals {
  tags {
    "Created By"     = "Terraform"
    "Git Branch"     = "${var.git_branch}"
    "Git Repository" = "${var.git_repository}"
    Environment      = "${var.environment[terraform.workspace]}"
    Project          = "website"
  }

  filenames = "${split(", ", lookup(data.external.website_files.result, "filenames"))}"
}

resource "aws_s3_bucket" "website_bucket" {
  acl           = "private"
  bucket_prefix = "${var.dns_name}.${var.environment[terraform.workspace]}"
  tags          = "${merge(map("Name", "website"), local.tags)}"
}

resource "aws_s3_bucket_object" "website_files" {
  # cannot have computed count, so this has to be increased when new files are added
  count = "8"

  bucket = "${aws_s3_bucket.website_bucket.id}"
  key    = "${local.filenames[count.index]}"
  source = "./src/${element(local.filenames, count.index)}"
}
