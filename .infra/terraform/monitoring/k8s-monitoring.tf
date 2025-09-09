resource "helm_release" "k8s-monitoring" {

  name       = "k8s-monitoring"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "k8s-monitoring"
  version    = "3.3.1"
  namespace  = "monitoring"
  depends_on = [helm_release.loki]

  values = [
    templatefile("${path.module}/k8s-monitoring.yml.tftpl", {
      cluster_name = var.cluster_name
  })]
}
