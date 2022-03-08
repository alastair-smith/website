variable "environment" {
  description = "The tier of the environment, either prod for the default branch, or the branch slug otherwise."

  validation {
    condition = (
      length(var.environment) > 0 &&
      regex("^[a-zA-Z0-9-]*$", var.environment) == var.environment
    )
    error_message = "The environment value should be prod or the slug of a branch name."
  }
}

variable "repository" {
  description = "The full repo URL"

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

  validation {
    condition     = length(var.service) > 0
    error_message = "The service value should have a length."
  }
}
