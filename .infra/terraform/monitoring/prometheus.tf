resource "kubernetes_secret" "alertmanager_slack_oauth" {
  metadata {
    name      = "alertmanager-slack-oauth"
    namespace = "monitoring"
  }

  data = {
    oauth_token = var.slack_oauth
  }

  type = "Opaque"
}

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

      # Disable control plane component monitoring for managed clusters
      kubeScheduler = {
        enabled = false # Disable kube-scheduler monitoring
      }

      kubeControllerManager = {
        enabled = false # Disable controller-manager monitoring  
      }

      kubeEtcd = {
        enabled = false # Disable etcd monitoring
      }

      kubeProxy = {
        enabled = false # Disable kube proxy monitoring
        service = {
          enabled = false
        }
        serviceMonitor = {
          enabled = false
        }
      }

      kubelet = {
        enabled = true
      }

      kubeStateMetrics = {
        enabled = true
      }

      alertmanager = {
        alertmanagerSpec = {
          secrets = ["alertmanager-slack-oauth"]
        }

        config = {
          route = {
            group_by        = ["alertname", "cluster", "service"]
            group_wait      = "10s"
            group_interval  = "10s"
            repeat_interval = "1h"
            receiver        = "default-slack"

            routes = [
              {
                match = {
                  severity = "critical"
                }
                receiver = "critical-slack"
              },
              {
                match = {
                  severity = "warning"
                }
                receiver = "warning-slack"
              },
              {
                match = {
                  alertname = "Watchdog"
                }
                receiver = "null"
              }
            ]
          }

          receivers = [
            {
              name = "null"
            },
            {
              name = "default-slack"
              slack_configs = [
                {
                  api_url = "https://slack.com/api/chat.postMessage"
                  http_config = {
                    authorization = {
                      type             = "Bearer"
                      credentials_file = "/etc/alertmanager/secrets/alertmanager-slack-oauth/oauth_token"
                    }
                  }

                  channel    = var.slack_channel
                  username   = "AlertManager"
                  icon_emoji = ":warning:"
                  title      = "{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
                  text       = <<-EOT
                  {{ range .Alerts }}
                  *Description:* {{ .Annotations.description }}
                  *Severity:* {{ .Labels.severity }}
                  *Instance:* {{ .Labels.instance }}
                  {{ end }}
                  EOT

                  fields = [
                    {
                      title = "Alertname"
                      value = "{{ .GroupLabels.alertname }}"
                      short = true
                    },
                    {
                      title = "Severity"
                      value = "{{ .GroupLabels.severity }}"
                      short = true
                    },
                    {
                      title = "Instance"
                      value = "{{ .GroupLabels.instance }}"
                      short = true
                    }
                  ]
                }
              ]
            },
            {
              name = "critical-slack"
              slack_configs = [
                {
                  api_url = "https://slack.com/api/chat.postMessage"
                  http_config = {
                    authorization = {
                      type             = "Bearer"
                      credentials_file = "/etc/alertmanager/secrets/alertmanager-slack-oauth/oauth_token"
                    }
                  }

                  channel    = var.slack_channel
                  username   = "AlertManager"
                  icon_emoji = ":fire:"
                  color      = "danger"
                  title      = "🚨 CRITICAL ALERT: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
                  text       = <<-EOT
                  {{ range .Alerts }}
                  *Description:* {{ .Annotations.description }}
                  *Severity:* {{ .Labels.severity }}
                  *Instance:* {{ .Labels.instance }}
                  *Runbook:* {{ .Annotations.runbook_url }}
                  {{ end }}
                  EOT

                  fields = [
                    {
                      title = "Alertname"
                      value = "{{ .GroupLabels.alertname }}"
                      short = true
                    },
                    {
                      title = "Severity"
                      value = "{{ .GroupLabels.severity }}"
                      short = true
                    },
                    {
                      title = "Instance"
                      value = "{{ .GroupLabels.instance }}"
                      short = true
                    },
                    {
                      title = "Runbook"
                      value = "{{ range .Alerts }}{{ .Annotations.runbook_url }}{{ end }}"
                      short = false
                    }
                  ]
                }
              ]
            },
            {
              name = "warning-slack"
              slack_configs = [
                {
                  api_url = "https://slack.com/api/chat.postMessage"
                  http_config = {
                    authorization = {
                      type             = "Bearer"
                      credentials_file = "/etc/alertmanager/secrets/alertmanager-slack-oauth/oauth_token"
                    }
                  }

                  channel    = var.slack_channel
                  username   = "AlertManager"
                  icon_emoji = ":warning:"
                  color      = "warning"
                  title      = "⚠️ WARNING: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}"
                  text       = <<-EOT
                  {{ range .Alerts }}
                  *Description:* {{ .Annotations.description }}
                  *Severity:* {{ .Labels.severity }}
                  *Instance:* {{ .Labels.instance }}
                  {{ end }}
                  EOT

                  fields = [
                    {
                      title = "Alertname"
                      value = "{{ .GroupLabels.alertname }}"
                      short = true
                    },
                    {
                      title = "Severity"
                      value = "{{ .GroupLabels.severity }}"
                      short = true
                    },
                    {
                      title = "Instance"
                      value = "{{ .GroupLabels.instance }}"
                      short = true
                    }
                  ]
                }
              ]
            }
          ]
        }
      }

      defaultRules = {
        create = true

        disabled = {
          KubeJobFailed = true # We use a custom alert
        }
      }
    })
  ]
}
