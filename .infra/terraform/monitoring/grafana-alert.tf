resource "kubernetes_manifest" "configmap_grafana_alerting_notification_policies" {
  depends_on = [helm_release.prometheus]

  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ConfigMap"
    "metadata" = {
      "name"      = "grafana-alerting-notification-policies"
      "namespace" = "monitoring"
      "labels" = {
        "grafana_alerting" = "1"
      }
    }
    "data" = {
      "notification-policies.yaml" = <<-EOT
        apiVersion: 1
        policies:
            - orgId: 1
              receiver: Slack
              group_by:
                - grafana_folder
                - alertname
              routes:
                - receiver: Job slack
                  group_by:
                    - '...'
                  object_matchers:
                    - - alertname
                      - =~
                      - KubernetesJobSucceeded|KubernetesJobFailed
                  continue: true
              group_wait: 30s
              group_interval: 5m
              repeat_interval: 4h
      EOT
    }
  }
}


resource "kubernetes_manifest" "configmap_grafana_alerting_job_rules" {
  depends_on = [helm_release.prometheus]

  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ConfigMap"
    "metadata" = {
      "name"      = "grafana-alerting-job-rules"
      "namespace" = "monitoring"
      "annotations" = {
        "grafana_folder" = "Jobs"
      }
      "labels" = {
        "grafana_alerting" = "1"
      }
    }
    "data" = {
      "job-alert-rules.yaml" = <<-EOT
        apiVersion: 1
        groups:
            - orgId: 1
              name: Job
              folder: Jobs
              interval: 10s
              rules:
                - uid: eewhcgeijt69sd
                  title: KubernetesJobSucceeded
                  condition: C
                  data:
                    - refId: A
                      relativeTimeRange:
                        from: 600
                        to: 0
                      datasourceUid: prometheus
                      model:
                        editorMode: code
                        expr: kube_job_complete > 0 and on(job_name, namespace) kube_job_status_completion_time > (time() - 300)
                        instant: true
                        intervalMs: 1000
                        legendFormat: __auto
                        maxDataPoints: 43200
                        range: false
                        refId: A
                    - refId: C
                      datasourceUid: __expr__
                      model:
                        conditions:
                            - evaluator:
                                params:
                                    - 0
                                type: gt
                              operator:
                                type: and
                              query:
                                params:
                                    - C
                              reducer:
                                params: []
                                type: last
                              type: query
                        datasource:
                            type: __expr__
                            uid: __expr__
                        expression: A
                        intervalMs: 1000
                        maxDataPoints: 43200
                        refId: C
                        type: threshold
                  noDataState: OK
                  execErrState: Error
                  annotations:
                    description: Job {{ $labels.job_name }} completed successfully
                    summary: Job {{ $labels.job_name }} succeeded
                  labels:
                    severity: info
                  isPaused: false
                  notification_settings:
                    receiver: Job slack
                    group_by:
                        - grafana_folder
                        - alertname
                        - '...'
                    group_wait: 30s
                    group_interval: 30s
                    repeat_interval: 10m
                - uid: cewhcjrvs7bwgc
                  title: KubernetesJobFailed
                  condition: C
                  data:
                    - refId: A
                      relativeTimeRange:
                        from: 300
                        to: 0
                      datasourceUid: prometheus
                      model:
                        disableTextWrap: false
                        editorMode: code
                        exemplar: false
                        expr: |-
                            kube_job_failed{condition="true"} > 0
                            and on(job_name, namespace)
                            kube_job_status_start_time > (time() - 86400)
                        format: time_series
                        fullMetaSearch: false
                        includeNullMetadata: true
                        instant: true
                        intervalMs: 1000
                        legendFormat: __auto
                        maxDataPoints: 43200
                        range: false
                        refId: A
                        useBackend: false
                    - refId: C
                      datasourceUid: __expr__
                      model:
                        conditions:
                            - evaluator:
                                params:
                                    - 0
                                type: gt
                              operator:
                                type: and
                              query:
                                params:
                                    - C
                              reducer:
                                params: []
                                type: last
                              type: query
                        datasource:
                            type: __expr__
                            uid: __expr__
                        expression: A
                        intervalMs: 1000
                        maxDataPoints: 43200
                        refId: C
                        type: threshold
                  noDataState: OK
                  execErrState: Error
                  annotations:
                    description: Job {{ $labels.job_name }} in {{ $labels.namespace }} failed
                    summary: Job {{ $labels.job_name }} failed
                  labels:
                    severity: critical
                  isPaused: false
                  notification_settings:
                    receiver: Job slack
                    group_by:
                        - grafana_folder
                        - alertname
                        - '...'
                    group_wait: 30s
                    group_interval: 30s
                    repeat_interval: 2d
      EOT
    }
  }
}


resource "kubernetes_manifest" "configmap_grafana_contact_points" {
  depends_on = [helm_release.prometheus]

  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ConfigMap"
    "metadata" = {
      "name"      = "grafana-contact-points"
      "namespace" = "monitoring"
      "labels" = {
        "grafana_alerting" = "1"
      }
    }
    "data" = {
      "contact-points.yaml" = <<-EOT
        apiVersion: 1
        contactPoints:
            - orgId: 1
              name: Job slack
              receivers:
                - uid: dewhc0s9sl2ioc
                  type: slack
                  settings:
                    color: '{{ if eq .CommonLabels.alertname "KubernetesJobFailed" }}#D63232{{ else }}#36a64f{{ end }}'
                    recipient: '#exposition-ij-alerting'
                    text: "{{ range .Alerts }}{{ if eq .Labels.alertname \"KubernetesJobFailed\" }}\U0001F6A8 Job *{{ .Labels.job_name }}* failed in `{{ .Labels.namespace }}`{{ else if eq .Labels.alertname \"KubernetesJobSucceeded\" }}✅ Job *{{ .Labels.job_name }}* succeeded in `{{ .Labels.namespace }}`{{ else }}\U0001F4E2 {{ .Labels.alertname }}: *{{ .Labels.job_name }}* in `{{ .Labels.namespace }}`{{ end }}{{ end }}"
                    title: Job Alert
                    token: ${var.slack_oauth}
                  disableResolveMessage: true
      EOT
    }
  }
}


resource "kubernetes_manifest" "configmap_grafana_contact_points_default" {
  depends_on = [helm_release.prometheus]

  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ConfigMap"
    "metadata" = {
      "name"      = "grafana-contact-points"
      "namespace" = "monitoring"
      "labels" = {
        "grafana_alerting" = "1"
      }
    }
    "data" = {
      "contact-points.yaml" = <<-EOT
        apiVersion: 1
        contactPoints:
            - orgId: 1
              name: Slack
              receivers:
                - uid: eewhbpzwcx7ggb
                  type: slack
                  settings:
                    recipient: '#exposition-ij-alerting'
                    token: ${var.slack_oauth}
                  disableResolveMessage: false
      EOT
    }
  }
}
