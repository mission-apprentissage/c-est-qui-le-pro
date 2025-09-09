resource "kubernetes_manifest" "configmap_ingress_blocked_ips_config" {
  depends_on = [helm_release.ingress-nginx]
  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ConfigMap"

    "metadata" = {
      "name"      = "blocked-ips-config"
      "namespace" = "ingress-nginx"
    }

    "data" = {
      "blocked-ips.conf" = <<-EOT
        # Blocked IPs (updated automatically)
        # Format: IP_ADDRESS 1;
        default 0;

        # IPs will be added here by the updater script
      EOT
    }
  }

  field_manager {
    force_conflicts = true
  }
}


resource "kubernetes_manifest" "service_account_ingress_blocked_ips_config" {
  depends_on = [helm_release.ingress-nginx]
  manifest = {
    "apiVersion" = "v1"
    "kind"       = "ServiceAccount"

    "metadata" = {
      "name"      = "blacklist-updater"
      "namespace" = "ingress-nginx"
    }
  }
}

resource "kubernetes_manifest" "role_ingress_blocked_ips_config" {
  depends_on = [helm_release.ingress-nginx]
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind"       = "Role"

    "metadata" = {
      "name"      = "blacklist-updater"
      "namespace" = "ingress-nginx"
    }

    "rules" = [
      {
        "apiGroups"     = [""]
        "resources"     = ["configmaps"]
        "resourceNames" = ["blocked-ips-config"]
        "verbs"         = ["get", "create", "update", "patch", "replace"]
      },
      {
        "apiGroups"     = ["apps"]
        "resources"     = ["deployments"]
        "resourceNames" = ["ingress-nginx-controller"]
        "verbs"         = ["get", "patch"]
      }
    ]
  }
}

resource "kubernetes_manifest" "role_binding_ingress_blocked_ips_config" {
  depends_on = [helm_release.ingress-nginx]
  manifest = {
    "apiVersion" = "rbac.authorization.k8s.io/v1"
    "kind"       = "RoleBinding"

    "metadata" = {
      "name"      = "blacklist-updater"
      "namespace" = "ingress-nginx"
    }

    "roleRef" = {
      "apiGroup" = "rbac.authorization.k8s.io"
      "kind"     = "Role"
      "name"     = "blacklist-updater"
    }

    "subjects" = [
      {
        "kind"      = "ServiceAccount"
        "name"      = "blacklist-updater"
        "namespace" = "ingress-nginx"
      }
    ]
  }
}


resource "kubernetes_manifest" "cron_ingress_blocked_ips_config" {
  depends_on = [helm_release.ingress-nginx]
  manifest = {
    "apiVersion" = "batch/v1"
    "kind"       = "CronJob"

    "metadata" = {
      "name"      = "blacklist-updater"
      "namespace" = "ingress-nginx"
    }

    "spec" = {
      "schedule" = "0 5 * * *"

      "jobTemplate" = {
        "spec" = {
          "template" = {
            "spec" = {
              "serviceAccountName" = "blacklist-updater"
              "restartPolicy"      = "OnFailure"
              "containers" = [
                {
                  "name"    = "updater"
                  "image"   = "alpine:latest"
                  "command" = ["/bin/sh"]
                  "args" = [
                    "-c",
                    <<-EOT
                    apk add --no-cache curl kubectl
              
                    echo "Downloading blacklist..."
                    
                    # Download blacklist and format for nginx geo module
                    curl -sf https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt | \
                      grep -v "^#" | \
                      awk '$2 >= ENVIRON["MIN_SCORE"] {print $1 " 1;"}' > /tmp/blocked-ips.conf

                    # Add default at the beginning
                    echo "default 0;" > /tmp/final-blocked-ips.conf
                    cat /tmp/blocked-ips.conf >> /tmp/final-blocked-ips.conf
                    
                    # Update the ConfigMap
                    kubectl create configmap blocked-ips-config \
                      --from-file=blocked-ips.conf=/tmp/final-blocked-ips.conf \
                      --namespace=ingress-nginx \
                      --dry-run=client -o yaml | kubectl replace -f -

                    echo "Triggering NGINX restart..."
                    kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx


                    IP_COUNT=$(wc -l < /tmp/blocked-ips.conf)
                    echo "Updated blacklist with $IP_COUNT IPs"
                  EOT
                  ]
                  "env" = [
                    {
                      "name"  = "MIN_SCORE"
                      "value" = "3"
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  }
}

