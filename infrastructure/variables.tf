variable "app_directory_path" {
  description = "The absolute path to the built app"
}

variable "build" {
  description = "Build number"
}

variable "commit" {
  description = "Full git commit sha"
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
