locals {
  name_prefix          = "${var.tags.Environment}-kelly"
  kelly_lambda_runtime = "nodejs14.x"
  tags                 = merge(var.tags, { Name = local.name_prefix })
}

resource "aws_cloudwatch_log_group" "function_logs" {
  name = "/aws/lambda/${local.name_prefix}"
  tags = local.tags
}

data "aws_iam_policy_document" "trust_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

data "aws_iam_policy_document" "permissions_policy" {
  statement {
    sid       = "logs"
    resources = ["${aws_cloudwatch_log_group.function_logs.arn}:*"]

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
  }
}

resource "aws_iam_role" "role" {
  assume_role_policy = data.aws_iam_policy_document.trust_policy.json
  name               = local.name_prefix
  tags               = local.tags
}

resource "aws_iam_policy" "permissions" {
  name   = local.name_prefix
  policy = data.aws_iam_policy_document.permissions_policy.json
  tags   = local.tags
}

resource "aws_iam_role_policy_attachment" "permissions" {
  policy_arn = aws_iam_policy.permissions.arn
  role       = aws_iam_role.role.name
}

resource "aws_lambda_function" "kelly" {
  function_name = local.name_prefix
  handler       = "index.handler"
  layers        = [aws_lambda_layer_version.kelly_dependencies.arn]
  role          = aws_iam_role.role.arn
  runtime       = local.kelly_lambda_runtime
  s3_bucket     = var.package_bucket
  s3_key        = var.kelly_function_key
  tags          = local.tags

  depends_on = [
    aws_iam_role_policy_attachment.permissions
  ]
}

resource "aws_lambda_layer_version" "kelly_dependencies" {
  compatible_architectures = ["x86_64"]
  compatible_runtimes      = [local.kelly_lambda_runtime]
  description              = "Dependencies required for the Kelly lambda function"
  layer_name               = "${local.name_prefix}-dependencies"
  s3_bucket                = var.package_bucket
  s3_key                   = var.kelly_layer_key
}
