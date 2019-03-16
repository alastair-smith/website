variable "dns_name" {
  description = "The name of the dns for the website to use"
}

variable "environment" {
  description = "The environment that has been deployed"
  type        = "map"
}

variable "git_branch" {
  description = "The branch of git that has been deployed"
  default     = ""
}

variable "git_repository" {
  description = "The repository that has been deployed"
  default     = ""
}

variable "feature_whitelist_cidr" {
  description = "The single cidr range to allow access to feature branch environments"
}

variable "zone_id" {
  description = "The cloudflare zone for DNS"
}
