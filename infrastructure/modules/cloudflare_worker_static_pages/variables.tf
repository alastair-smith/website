variable "cloudflare_zone_id" {
  description = "The id of the cloudflare zone to create the wrangler in, must align with the hostname variable"
  type        = string
}

variable "hostname" {
  description = "Name of the website"
  type        = string
}

variable "static_app_directory_path" {
  description = "Path to the directory on the local machine to be uploaded and served from S3"
  type        = string
}

variable "worker_path" {
  description = "Path to the worker script to serve static pages"
  type        = string
}
