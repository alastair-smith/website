variable "cloudflare_worker_scripts" {
  description = "The absolute path to the worker scripts directory"
  type        = string
}

variable "dynamic_app_directory_path" {
  description = "Path to the directory on the local machine to be uploaded and served as workers"
  type        = string
}

variable "kelly_function_key" {
  description = "The path within the build bucket to the kelly function zip"
  type        = string
}

variable "kelly_layer_key" {
  description = "The path within the build bucket to the kelly dependencies zip"
  type        = string
}

variable "package_bucket" {
  description = "Name of the S3 bucket storing the build artifacts"
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

variable "root_domain" {
  description = "Root domain registered with cloudflare"
  type        = string
}

variable "service" {
  description = "The name of the service"
  type        = string

  validation {
    condition     = length(var.service) > 0
    error_message = "The service value should have a length."
  }
}

variable "static_app_directory_path" {
  description = "The absolute path to the built app"
  type        = string
}
