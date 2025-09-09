resource "helm_release" "cert-manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io/"
  chart            = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true

  set = [{
    name  = "installCRDs"
    value = "true"
  }]

  values = [<<EOT
config:
  featureGates:
    # Disable the use of Exact PathType in Ingress resources, to work around a bug in ingress-nginx
    # https://github.com/kubernetes/ingress-nginx/issues/11176
    ACMEHTTP01IngressPathTypeExact: false
EOT
  ]

}

resource "kubectl_manifest" "clusterissuer" {
  for_each = { for issuer in var.issuers : issuer.name => issuer }
  provider = kubectl
  yaml_body = templatefile("issuer.yml.tftpl", {
    name                    = each.value.name
    email                   = each.value.email
    server                  = each.value.server
    private_key_secret_name = each.value.private_key_secret_name
  })

  depends_on = [
    helm_release.cert-manager
  ]
}
