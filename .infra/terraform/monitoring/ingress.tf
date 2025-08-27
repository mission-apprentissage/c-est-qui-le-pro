resource "kubectl_manifest" "monitoring-ingress" {
  provider = kubectl
  yaml_body = templatefile("${path.module}/ingress.yml.tftpl", {
    monitoring_host = var.monitoring_host
  })
  depends_on = [
    helm_release.prometheus
  ]
}
