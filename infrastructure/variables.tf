variable "app_directory_path" {
  description = "The absolute path to the built app"
}

variable "build" {
  description = "Build number"
}

variable "cloudflare_worker_scripts" {
  description = "The absolute path to the worker scripts directory"
}

variable "commit" {
  description = "Full git commit sha"
}

variable "kelly_layer_key" {
  description = "The path within the build bucket to the kelly dependencies zip"
}

variable "package_bucket" {
  description = "Name of the S3 bucket storing the build artifacts"
}

variable "repository" {
  description = "The full repo URL"
}

variable "root_domain" {
  description = "Root domain registered with cloudflare"
}

variable "service" {
  description = "The name of the service"
}
