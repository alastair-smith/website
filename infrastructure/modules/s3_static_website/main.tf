locals {
  # see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  content_types       = jsondecode(file("${path.module}/content-types.json"))
  no_cache_extensions = ["html", "htm"]
}

resource "aws_s3_bucket" "website" {
  acl    = "public-read"
  bucket = var.hostname
  tags   = merge({ Name = var.hostname }, var.tags)

  website {
    index_document = "index.html"
    error_document = "404.html"
  }
}

data "aws_iam_policy_document" "bucket_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${aws_s3_bucket.website.id}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "policy" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

resource "aws_s3_bucket_object" "website_files" {
  for_each = fileset(var.app_directory_path, "**")

  bucket        = aws_s3_bucket.website.id
  cache_control = contains(local.no_cache_extensions, basename(replace(each.key, ".", "/"))) ? "no-cache" : "public, max-age=31536000, immutable"
  content_type  = local.content_types[basename(replace(each.key, ".", "/"))]
  etag          = filemd5("${var.app_directory_path}/${each.key}")
  key           = each.key
  source        = "${var.app_directory_path}/${each.key}"
  tags          = merge({ Name = each.key }, var.tags)
}
