output "value" {
  value = {
    Build       = var.build
    Commit      = var.commit
    Environment = var.environment
    Repository  = var.repository
    Service     = var.service
  }
}
