resource "helm_release" "ingress-nginx" {
  depends_on       = [helm_release.cert-manager]
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true

  values = [
    yamlencode({
      controller = {
        service = {
          loadBalancerIP = var.loadbalancer_ip
          annotations = {
            "loadbalancer.openstack.org/keep-floatingip" = "true"
            "loadbalancer.openstack.org/proxy-protocol"  = "v2"
          }
        }

        config = {
          "enable-modsecurity"           = "true"
          "enable-owasp-modsecurity-crs" = "true"
          "use-proxy-protocol"           = "true"
          "real-ip-header"               = "proxy_protocol"
          "proxy-protocol"               = "true"
          "rate-limit-rps"               = "13"

          "global-allowed-response-headers" = "X-Frame-Options,X-Content-Type-Options,X-XSS-Protection,Referrer-Policy,Strict-Transport-Security,Content-Security-Policy,X-Robots-Tag,X-Environment"

          "http-snippet" = <<-EOF
            # Zone de mémoire pour rate limiting
            limit_req_zone $binary_remote_addr zone=flood:10m rate=800r/m;
            limit_req_log_level error;
          EOF

          "server-snippet" = <<-EOF
            # Appliquer le rate limiting
            limit_req zone=flood burst=100 nodelay;
          EOF

          "modsecurity-snippet" = <<-EOF
            SecRuleEngine On
            # Enable scanning of the request body
            SecRequestBodyAccess On

            SecAuditLog /dev/stdout
            SecAuditLogFormat JSON
            SecAuditEngine RelevantOnly

            # ModSecurity Rule Exclusion: Disable all SQLi and XSS rules for metabase
            SecRule REQUEST_FILENAME "@beginsWith /metabase" \
                "id:1004,\
                phase:2,\
                pass,\
                nolog,\
                ctl:ruleRemoveById=941000-942999"

            SecRule REQUEST_FILENAME "@beginsWith /metabase" \
                "id:1005,\
                phase:1,\
                pass,\
                nolog,\
                ctl:ruleRemoveById=200002-200007"

            SecRule REQUEST_FILENAME "@beginsWith /metabase" \
                "id:1006,\
                phase:1,\
                pass,\
                nolog,\
                ctl:ruleRemoveById=920170-920170"

            SecRule REQUEST_FILENAME "@beginsWith /api" \
                "id:1008,\
                phase:1,\
                pass,\
                nolog,\
                ctl:ruleRemoveById=942100-942100"

            # disable this rule for grafana, ssl, metabase
            SecRule REQUEST_URI "@unconditionalMatch" \
                "id:1009,\
                phase:1,\
                pass,\
                nolog,\
                ctl:ruleRemoveById=949110-949110"
          EOF
        }
      }
    })
  ]

}

data "kubernetes_service" "ingress-svc" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = helm_release.ingress-nginx.namespace
  }
  depends_on = [
    helm_release.ingress-nginx
  ]
}

output "ingress_ip" {
  value       = data.kubernetes_service.ingress-svc.status.0.load_balancer.0.ingress.0.ip
  description = "Address of the loadbalancer"
}
