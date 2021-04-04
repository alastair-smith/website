variable "build" {
  description = "Build number"

  validation {
    condition = (
      tonumber(var.build) == tostring(var.build) &&
      var.build > 0 &&
      var.build % 1 == 0
    )
    error_message = "The build value must be a positive number"
  }
}

variable "commit" {
  description = "Full git commit sha"

  validation {
    condition = regex("[[:xdigit:]]{40}", var.commit) == var.commit
    error_message = "The commit value should be the full 40 character commit sha"
  }
}

variable "environment" {
  description = "The tier of the environment"

  validation {
    condition = (
      var.environment == "dev" ||
      var.environment == "prod"
    )
    error_message = "The environment value should be dev or prod"
  }
}

variable "repository" {
  description = "The full repo URL"

  validation {
    condition = (
      regex("^https://.*$", var.repository) == var.repository &&
      length(var.repository) > 9
    )
    error_message = "The repository value should be the full URL to access the git repo"
  }
}

variable "service" {
  description = "The name of the service"

  validation {
    condition = length(var.service) > 0
    error_message = "The service value should have a length"
  }
}
