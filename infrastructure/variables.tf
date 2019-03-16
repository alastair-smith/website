variable "dns_name" {
  description = "The root name of the dns for the website to use"
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

variable "whitelist_cidr" {
  description = "Single cidr to allow access to s3 bucket for debugging purposes"
}

variable "zone_id" {
  description = "The cloudflare zone for DNS"
}
