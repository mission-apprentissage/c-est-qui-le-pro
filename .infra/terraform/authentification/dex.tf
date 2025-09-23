# Create namespace for authentication system
resource "kubernetes_namespace" "auth_system" {
  metadata {
    name = "auth-system"
    labels = {
      name = "auth-system"
    }
  }
}

# Secret for GitHub OAuth credentials
resource "kubernetes_secret" "github_oauth" {
  metadata {
    name      = "github-oauth"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
  }

  data = {
    client-id     = var.github_client_id
    client-secret = var.github_client_secret
  }

  type = "Opaque"
}

# ConfigMap for Dex configuration
resource "kubernetes_config_map" "dex_config" {
  metadata {
    name      = "dex-config"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
  }

  data = {
    "config.yaml" = templatefile("${path.module}/dex-config.yaml.tpl", {
      dex_domain = var.dex_domain
      github_org = var.github_org
    })
  }
}

# Service Account for Dex
resource "kubernetes_service_account" "dex" {
  metadata {
    name      = "dex"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
  }
}

# ClusterRole for Dex
resource "kubernetes_cluster_role" "dex" {
  metadata {
    name = "dex"
  }

  rule {
    api_groups = ["dex.coreos.com"]
    resources  = ["*"]
    verbs      = ["*"]
  }

  rule {
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
    verbs      = ["create", "get", "list", "watch"]
  }
}

# ClusterRoleBinding for Dex
resource "kubernetes_cluster_role_binding" "dex" {
  metadata {
    name = "dex"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.dex.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.dex.metadata[0].name
    namespace = kubernetes_namespace.auth_system.metadata[0].name
  }
}

# Dex Deployment
resource "kubernetes_deployment" "dex" {
  metadata {
    name      = "dex"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
    labels = {
      app = "dex"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "dex"
      }
    }

    template {
      metadata {
        labels = {
          app = "dex"
        }
      }

      spec {
        service_account_name = kubernetes_service_account.dex.metadata[0].name

        container {
          name  = "dex"
          image = "ghcr.io/dexidp/dex:v2.37.0"

          command = ["/usr/local/bin/dex", "serve", "/etc/dex/cfg/config.yaml"]

          port {
            name           = "https"
            container_port = 5556
            protocol       = "TCP"
          }

          env {
            name = "GITHUB_CLIENT_ID"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.github_oauth.metadata[0].name
                key  = "client-id"
              }
            }
          }

          env {
            name = "GITHUB_CLIENT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.github_oauth.metadata[0].name
                key  = "client-secret"
              }
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/dex/cfg"
          }

          liveness_probe {
            http_get {
              path = "/healthz"
              port = 5556
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/healthz"
              port = 5556
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }

        volume {
          name = "config"
          config_map {
            name = kubernetes_config_map.dex_config.metadata[0].name
          }
        }
      }
    }
  }
}

# Dex Service
resource "kubernetes_service" "dex" {
  metadata {
    name      = "dex"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
    labels = {
      app = "dex"
    }
  }

  spec {
    selector = {
      app = "dex"
    }

    port {
      name        = "dex"
      port        = 5556
      target_port = 5556
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }
}

# Ingress for Dex
resource "kubernetes_ingress_v1" "dex" {
  metadata {
    name      = "dex"
    namespace = kubernetes_namespace.auth_system.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                  = "nginx"
      "cert-manager.io/cluster-issuer"               = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect"     = "true"
      "nginx.ingress.kubernetes.io/backend-protocol" = "HTTP"
    }
  }

  spec {
    tls {
      hosts       = [var.dex_domain]
      secret_name = "dex-tls"
    }

    rule {
      host = var.dex_domain

      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.dex.metadata[0].name
              port {
                number = 5556
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_cluster_role_binding" "github_admin_users" {
  count = length(var.admin_users) > 0 ? 1 : 0

  metadata {
    name = "github-admin-users"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "cluster-admin"
  }

  dynamic "subject" {
    for_each = var.admin_users
    content {
      kind      = "User"
      name      = subject.value # GitHub username
      api_group = "rbac.authorization.k8s.io"
    }
  }
}

# Output important information
output "dex_url" {
  description = "Dex URL for OIDC configuration"
  value       = "https://${var.dex_domain}"
}
