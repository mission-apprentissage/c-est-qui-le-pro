
locals {
  kubeconfig_content = base64decode(var.kubeconfig)
  kubeconfig_yaml    = yamldecode(local.kubeconfig_content)
}

variable "kubeconfig" {
  description = "Base64 encoded kubeconfig"
  type        = string
  sensitive   = true
}

variable "cluster_name" {
  description = "Cluster name"
  type        = string
  default     = "CQLP"
}

variable "loadbalancer_ip" {
  type        = string
  description = "The IP of the load balancer"
}

variable "slack_oauth" {
  description = "Slack OAuth"
  type        = string
  sensitive   = true
}

variable "slack_channel" {
  description = "Slack channel"
  type        = string
}


variable "monitoring_host" {
  type        = string
  description = "Host for grafana"
  default     = "grafana.kub.recette.cestquilepro.inserjeunes.incubateur.net"
}

variable "monitoring_admin_password" {
  type        = string
  description = "Admin password for grafana"
  sensitive   = true
}

variable "docker_server" {
  description = "Docker registry server URL"
  type        = string
  default     = "https://index.docker.io/v1/"
}

variable "docker_username" {
  description = "Docker registry username"
  type        = string
  sensitive   = true
}

variable "docker_password" {
  description = "Docker registry password"
  type        = string
  sensitive   = true
}


variable "issuers" {
  type = list(object({
    name                    = string
    email                   = string
    server                  = string
    private_key_secret_name = string
  }))
  description = "List of issuers to create"
  default = [
    {
      name                    = "letsencrypt-prod"
      server                  = "https://acme-v02.api.letsencrypt.org/directory"
      email                   = "contact@inserjeunes.beta.gouv.fr",
      private_key_secret_name = "letsencrypt-prod"
      }, {
      name                    = "letsencrypt-staging"
      server                  = "https://acme-staging-v02.api.letsencrypt.org/directory"
      email                   = "contact@inserjeunes.beta.gouv.fr"
      private_key_secret_name = "letsencrypt-staging"
    }
  ]
}

