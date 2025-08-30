module "monitoring" {
  source                    = "./monitoring"
  monitoring_host           = var.monitoring_host
  monitoring_admin_password = var.monitoring_admin_password
  slack_oauth               = var.slack_oauth
  depends_on                = [helm_release.cert-manager]
}
