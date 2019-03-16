terraform {
  backend "s3" {
    key    = "website"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = "eu-west-1"
}

provider "cloudflare" {}

data "external" "website_files" {
  program = ["sh", "./get-website-files.sh"]
}

locals {
  content_types = {
    html = "text/html"
    js   = "application/javascript"
  }

  dns_value = {
    feature = "${var.environment[terraform.workspace]}.website"
    master  = ""
  }

  tags {
    "Created By"     = "Terraform"
    "Git Branch"     = "${var.git_branch}"
    "Git Repository" = "${var.git_repository}"
    Environment      = "${var.environment[terraform.workspace]}"
    Project          = "website"
  }

  filenames = "${sort(split(", ", lookup(data.external.website_files.result, "filenames")))}"
}

resource "aws_s3_bucket" "website_bucket" {
  acl           = "public-read"
  bucket_prefix = "${var.dns_name}.${var.environment[terraform.workspace]}"
  tags          = "${merge(map("Name", "website"), local.tags)}"

  website {
    index_document = "index.html"
    error_document = "404.html"
  }
}

data "cloudflare_ip_ranges" "cloudflare" {}

data "aws_iam_policy_document" "whitelist" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${aws_s3_bucket.website_bucket.id}/*"]

    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"

      values = [
        "${var.whitelist_cidr}",
        "${data.cloudflare_ip_ranges.cloudflare.cidr_blocks}",
      ]
    }

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "whitelist" {
  bucket = "${aws_s3_bucket.website_bucket.id}"
  policy = "${data.aws_iam_policy_document.whitelist.json}"
}

resource "aws_s3_bucket_object" "website_files" {
  # cannot have computed count, so this has to be increased when new files are added
  count = "8"

  bucket       = "${aws_s3_bucket.website_bucket.id}"
  content_type = "${lookup(local.content_types, basename(replace(local.filenames[count.index], ".", "/")))}"
  key          = "${local.filenames[count.index]}"
  source       = "../src/${element(local.filenames, count.index)}"
}

resource "cloudflare_record" "website" {
  domain  = "${var.dns_name}"
  name    = "${local.dns_value[terraform.workspace]}"
  proxied = true
  ttl     = 1
  type    = "CNAME"
  value   = "${aws_s3_bucket.website_bucket.website_endpoint}"
}
