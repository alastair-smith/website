variable "permissions_boundary_policy_name" {
  description = "Name of AWS IAM policy to restrict all created roles"
  type        = string
}

variable "repository" {
  description = "The full repo URL"
  type        = string

  validation {
    condition = (
      regex("^https://.*$", var.repository) == var.repository &&
      length(var.repository) > 9
    )
    error_message = "The repository value should be the full URL to access the git repo."
  }
}

variable "service" {
  description = "The name of the service"
  type        = string

  validation {
    condition     = length(var.service) > 0
    error_message = "The service value should have a length."
  }
}
