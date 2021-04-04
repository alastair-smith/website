variable "build" {
  description = "Build number"
}

variable "commit" {
  description = "Full git commit sha"
}

variable "environment" {
  description = "The tier of the environment"
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
