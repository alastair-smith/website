variable "permissions_boundary" {
  description = "ARN of AWS IAM policy to restrict all created roles"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
