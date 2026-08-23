locals {
  permissions_boundary = data.aws_iam_policy.permissions_boundary.arn
}

data "aws_iam_policy" "permissions_boundary" {
  name = var.permissions_boundary_policy_name
}

module "bort_endpoints" {
  source = "./modules/bort_endpoints"

  permissions_boundary = local.permissions_boundary
}
