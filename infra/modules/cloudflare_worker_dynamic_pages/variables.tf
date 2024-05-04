variable "dynamic_app_directory_path" {
  description = "Path to the directory on the local machine to be uploaded and served as workers"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables to provide to the workers"
  type        = map(string)
}

variable "cloudflare_zone_id" {
  description = "The id of the cloudflare zone to create the wrangler in, must align with the hostname variable"
  type        = string
}

variable "hostname" {
  description = "Name of the website"
  type        = string
}
