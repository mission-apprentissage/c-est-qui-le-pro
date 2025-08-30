resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = "77.0.2"
  namespace        = "monitoring"
  create_namespace = true

  values = [
    yamlencode({
      grafana = {
        replicaCount  = 1
        adminPassword = var.monitoring_admin_password
        persistence = {
          enabled = true
          size    = "500Mi"
        }

        sidecar = {
          dashboards = {
            enabled           = true
            defaultFolderName = "General"
            label             = "grafana_dashboard"
            labelValue        = "1"
            folderAnnotation  = "grafana_folder"
            searchNamespace   = "ALL"
            provider = {
              foldersFromFilesStructure = true
            }
          }
          alerting = {
            enabled         = true
            label           = "grafana_alerting"
            labelValue      = "1"
            searchNamespace = "ALL"

            # Alert rules configuration
            rules = {
              enabled = true
              folder  = "/etc/grafana/provisioning/alerting"
            }

            # Contact points configuration  
            contactpoints = {
              enabled = true
              folder  = "/etc/grafana/provisioning/alerting"
            }

            # Notification policies configuration
            policies = {
              enabled = true
              folder  = "/etc/grafana/provisioning/alerting"
            }
          }
        }

        additionalDataSources = [
          {
            name      = "Loki"
            type      = "loki"
            url       = "http://loki:3100/"
            basicAuth = false
            access    = "proxy"
          }
        ]
      }
    })
  ]
}
