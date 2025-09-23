module "authentification" {
  source               = "./authentification"
  github_client_id     = var.github_client_id
  github_client_secret = var.github_client_secret
  github_org           = var.github_org
  dex_domain           = var.dex_domain
  admin_users          = var.admin_users
  depends_on           = [helm_release.cert-manager]
}

