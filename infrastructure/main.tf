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
  bucket_prefix = "${var.dns_name}.${var.environment[terraform.workspace]}"

  tags {
    "Created By"     = "Terraform"
    "Git Branch"     = "${var.git_branch}"
    "Git Repository" = "${var.git_repository}"
    Environment      = "${var.environment[terraform.workspace]}"
    Project          = "website"
  }

  filenames = "${split(", ", lookup(data.external.website_files.result, "filenames"))}"

  whitelist_cidr = {
    feature = ["${var.feature_whitelist_cidr}"]
    master  = ["0.0.0.0/0"]
  }
}

data "aws_iam_policy_document" "whitelist" {
  statement {
    actions    = ["s3:GetObject"]
    principals = ["*"]
    resources  = ["arn:aws:s3:::${local.bucket_prefix}*"]

    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values   = ["${local.whitelist_cidr[terraform.workspace]}"]
    }
  }
}

resource "aws_s3_bucket" "website_bucket" {
  acl           = "public-read"
  bucket_prefix = "${local.bucket_prefix}"
  tags          = "${merge(map("Name", "website"), local.tags)}"
  policy        = "${data.aws_iam_policy_document.whitelist.json}"

  website {
    index_document = "index.html"
    error_document = "404.html"
  }
}

resource "aws_s3_bucket_object" "website_files" {
  # cannot have computed count, so this has to be increased when new files are added
  count = "8"

  bucket = "${aws_s3_bucket.website_bucket.id}"
  key    = "${local.filenames[count.index]}"
  source = "../src/${element(local.filenames, count.index)}"
}
