variable "kelly_function_key" {
  description = "Path to the kelly function zip within the package S3 bucket"
  type        = string
}

variable "kelly_layer_key" {
  description = "Path to the kelly layer zip within the package S3 bucket"
  type        = string
}

variable "log_retention_in_days" {
  description = "How long to keep logs before deleting them"
  type        = number
}

variable "package_bucket" {
  description = "Name of the S3 bucket containing built packages"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
