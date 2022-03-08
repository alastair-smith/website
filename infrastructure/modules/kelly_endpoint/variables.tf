variable "kelly_function_key" {
  description = "Path to the kelly function zip within the package S3 bucket"
}

variable "kelly_layer_key" {
  description = "Path to the kelly layer zip within the package S3 bucket"
}

variable "package_bucket" {
  description = "Name of the S3 bucket containing built packages"
}

variable "tags" {
  description = "Tags to apply to all resources"
}
