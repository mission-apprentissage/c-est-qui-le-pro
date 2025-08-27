resource "helm_release" "loki" {
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki"
  version    = "6.37.0"
  namespace  = "monitoring"
  depends_on = [helm_release.prometheus]

  values = [file("${path.module}/loki.yml")]
}
