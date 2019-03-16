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

variable "git_commit" {
  description = "The git commit that has been deployed"
  default     = ""
}

variable "git_repository" {
  description = "The repository that has been deployed"
  default     = ""
}
