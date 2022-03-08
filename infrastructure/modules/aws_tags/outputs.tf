output "value" {
  value = {
    Environment = var.environment
    Repository  = var.repository
    Service     = var.service
  }
}
