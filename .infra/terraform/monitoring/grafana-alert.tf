resource "grafana_contact_point" "job-slack" {
  name       = "Job slack"
  depends_on = [helm_release.prometheus]

  slack {
    color                   = "{{ if eq .CommonLabels.alertname \"KubernetesJobFailed\" }}#D63232{{ else }}#36a64f{{ end }}"
    recipient               = "#exposition-ij-alerting"
    text                    = "{{ range .Alerts }}{{ if eq .Labels.alertname \"KubernetesJobFailed\" }}\U0001F6A8 Job *{{ .Labels.job_name }}* failed in `{{ .Labels.namespace }}`{{ else if eq .Labels.alertname \"KubernetesJobSucceeded\" }}✅ Job *{{ .Labels.job_name }}* succeeded in `{{ .Labels.namespace }}`{{ else }}\U0001F4E2 {{ .Labels.alertname }}: *{{ .Labels.job_name }}* in `{{ .Labels.namespace }}`{{ end }}{{ end }}"
    title                   = "Job Alert"
    token                   = var.slack_oauth
    disable_resolve_message = true
  }
}

resource "grafana_contact_point" "slack" {
  name       = "Slack"
  depends_on = [helm_release.prometheus]
  slack {
    recipient = "#exposition-ij-alerting"
    token     = var.slack_oauth

  }
}


resource "grafana_notification_policy" "root_policy" {
  contact_point   = grafana_contact_point.slack.name
  group_by        = ["grafana_folder", "alertname"]
  group_wait      = "30s"
  group_interval  = "5m"
  repeat_interval = "4h"

  policy {
    matcher {
      label = "alertname"
      match = "=~"
      value = "KubernetesJobSucceeded|KubernetesJobFailed"
    }
    group_by      = ["..."]
    contact_point = grafana_contact_point.job-slack.name
    continue      = true
  }


  depends_on = [
    grafana_contact_point.slack,
    grafana_contact_point.job-slack
  ]
}

resource "grafana_folder" "rule_folder" {
  title = "Job alert"
}


resource "grafana_rule_group" "alert_job" {
  name             = "Job"
  folder_uid       = grafana_folder.rule_folder.uid
  interval_seconds = 10
  org_id           = 1


  rule {
    name      = "KubernetesJobSucceeded"
    condition = "C"

    no_data_state  = "OK"
    exec_err_state = "Error"
    is_paused      = false
    annotations = {
      "description" = "Job {{ $labels.job_name }} completed successfully"
      "summary"     = "Job {{ $labels.job_name }} succeeded"
    }
    labels = {
      "severity" = "info"
    }

    notification_settings {
      contact_point   = grafana_contact_point.job-slack.name
      group_by        = []
      group_wait      = "30s"
      group_interval  = "30s"
      repeat_interval = "10m"
    }

    data {
      ref_id = "A"
      relative_time_range {
        from = 600
        to   = 0
      }
      datasource_uid = "prometheus"
      model = jsonencode({
        editorMode    = "code"
        expr          = "kube_job_complete > 0 and on(job_name, namespace) kube_job_status_completion_time > (time() - 300)"
        instant       = true
        intervalMs    = 1000
        legendFormat  = "__auto"
        maxDataPoints = 43200
        range         = false
        refId         = "A"
      })
    }

    data {
      ref_id         = "C"
      datasource_uid = "__expr__"
      relative_time_range {
        from = 600
        to   = 0
      }
      model = <<EOT
        {
            "conditions": [
                {
                    "evaluator": {
                        "params": [
                            0
                        ],
                        "type": "gt"
                    },
                    "operator": {
                        "type": "and"
                    },
                    "query": {
                        "params": [
                            "C"
                        ]
                    },
                    "reducer": {
                        "params": [],
                        "type": "last"
                    },
                    "type": "query"
                }
            ],
            "datasource": {
                "type": "__expr__",
                "uid": "__expr__"
            },
            "expression": "A",
            "intervalMs": 1000,
            "maxDataPoints": 43200,
            "refId": "C",
            "type": "threshold"
        }
      EOT
    }
  }

  rule {
    name      = "KubernetesJobFailed"
    condition = "C"

    no_data_state  = "OK"
    exec_err_state = "Error"
    is_paused      = false
    annotations = {
      "description" = "Job {{ $labels.job_name }} in {{ $labels.namespace }} failed"
      "summary"     = "Job {{ $labels.job_name }} failed"
    }
    labels = {
      "severity" = "critical"
    }

    notification_settings {
      contact_point   = grafana_contact_point.job-slack.name
      group_by        = []
      group_wait      = "30s"
      group_interval  = "30s"
      repeat_interval = "10m"
    }

    data {
      ref_id = "A"
      relative_time_range {
        from = 600
        to   = 0
      }
      datasource_uid = "prometheus"
      model          = <<EOT
        {
            "disableTextWrap": false,
            "editorMode": "code",
            "exemplar": false,
            "expr": "kube_job_failed{condition=\"true\"} > 0\nand on(job_name, namespace)\nkube_job_status_start_time > (time() - 86400)",
            "format": "time_series",
            "fullMetaSearch": false,
            "includeNullMetadata": true,
            "instant": true,
            "intervalMs": 1000,
            "legendFormat": "__auto",
            "maxDataPoints": 43200,
            "range": false,
            "refId": "A",
            "useBackend": false
        }
      EOT
    }

    data {
      ref_id         = "C"
      datasource_uid = "__expr__"
      relative_time_range {
        from = 600
        to   = 0
      }
      model = <<EOT
        {
            "conditions": [
                {
                    "evaluator": {
                        "params": [
                            0
                        ],
                        "type": "gt"
                    },
                    "operator": {
                        "type": "and"
                    },
                    "query": {
                        "params": [
                            "C"
                        ]
                    },
                    "reducer": {
                        "params": [],
                        "type": "last"
                    },
                    "type": "query"
                }
            ],
            "datasource": {
                "type": "__expr__",
                "uid": "__expr__"
            },
            "expression": "A",
            "intervalMs": 1000,
            "maxDataPoints": 43200,
            "refId": "C",
            "type": "threshold"
        }
      EOT
    }
  }
}


