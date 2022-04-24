locals {
  name_prefix = "${terraform.workspace}-bort"
  tags        = merge(var.tags, { Name = local.name_prefix })
  counter_id  = "bort-count"
}

data "aws_region" "current" {}

resource "aws_dynamodb_table" "counter" {
  name           = local.name_prefix
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "id"
  tags           = local.tags

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table_item" "counter" {
  table_name = aws_dynamodb_table.counter.name
  hash_key   = aws_dynamodb_table.counter.hash_key

  item = jsonencode({
    id = {
      S = local.counter_id
    }
    value = {
      N = "0"
    }
  })

  lifecycle {
    ignore_changes = [
      item
    ]
  }
}

data "aws_iam_policy_document" "trust_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["apigateway.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "gateway_role" {
  assume_role_policy   = data.aws_iam_policy_document.trust_policy.json
  name                 = local.name_prefix
  permissions_boundary = var.permissions_boundary
  tags                 = local.tags
}

data "aws_iam_policy_document" "gateway_permissions" {
  statement {
    resources = [aws_dynamodb_table.counter.arn]

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]
  }
}

resource "aws_iam_policy" "gateway_permissions" {
  name   = local.name_prefix
  policy = data.aws_iam_policy_document.gateway_permissions.json
  tags   = local.tags
}

resource "aws_iam_role_policy_attachment" "gateway_permissions" {
  role       = aws_iam_role.gateway_role.name
  policy_arn = aws_iam_policy.gateway_permissions.arn
}

resource "aws_api_gateway_rest_api" "gateway" {
  name = local.name_prefix
  tags = local.tags
  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = local.name_prefix,
      version = "1.0.0"
    }
    paths = {
      "/" = {
        get = {
          responses = {
            "200" = {
              description = "200 response"
              content = {
                "application/json" = {
                  "schema" = {
                    "$ref" = "#/components/schemas/Empty"
                  }
                }
              }
            }
          }
          "x-amazon-apigateway-integration" = {
            credentials         = aws_iam_role.gateway_role.arn
            httpMethod          = "POST"
            passthroughBehavior = "never"
            type                = "aws"
            uri                 = "arn:aws:apigateway:${data.aws_region.current.name}:dynamodb:action/GetItem"

            responses = {
              default = {
                statusCode = "200"

                responseTemplates = {
                  "application/json" = "{\"count\": $input.path('$').Item.value.N}"
                }
              }
            }

            requestTemplates = {
              "application/json" = jsonencode({
                TableName = aws_dynamodb_table.counter.id
                Key       = { id = { S = local.counter_id } }
              })
            }
          }
        }
        post = {
          responses = {
            "200" = {
              description = "200 response"
              content = {
                "application/json" = {
                  "schema" = {
                    "$ref" = "#/components/schemas/Empty"
                  }
                }
              }
            }
          }
          "x-amazon-apigateway-integration" = {
            credentials         = aws_iam_role.gateway_role.arn
            httpMethod          = "POST"
            passthroughBehavior = "never"
            type                = "aws"
            uri                 = "arn:aws:apigateway:${data.aws_region.current.name}:dynamodb:action/UpdateItem"

            responses = {
              default = {
                statusCode = "200"

                responseTemplates = {
                  "application/json" = "{\"count\": $input.path('$').Attributes.value.N}"
                }
              }
            }

            requestTemplates = {
              "application/json" = jsonencode({
                ExpressionAttributeValues = {
                  ":inc" = { N = "1" }
                }

                ExpressionAttributeNames = {
                  "#value" = "value"
                }

                Key              = { id = { S = local.counter_id } }
                TableName        = aws_dynamodb_table.counter.id
                UpdateExpression = "ADD #value :inc"
                ReturnValues     = "UPDATED_NEW"
              })
            }
          }
        }
      }
    }
    components = {
      schemas = {
        Empty = {
          title = "Empty Schema"
          type  = "object"
        }
      }
    }
  })

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.gateway.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.gateway.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.gateway.id
  stage_name    = "stage"
  tags          = local.tags
}
