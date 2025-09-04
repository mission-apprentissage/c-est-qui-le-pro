terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0.2"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.19.0"
    }

    grafana = {
      source  = "grafana/grafana"
      version = "~> 3.0"
    }
  }

  required_version = "~> 1.3"
}


provider "helm" {
  kubernetes = {
    host                   = local.kubeconfig_yaml.clusters[0].cluster.server
    cluster_ca_certificate = base64decode(local.kubeconfig_yaml.clusters[0].cluster.certificate-authority-data)
    client_certificate     = base64decode(local.kubeconfig_yaml.users[0].user.client-certificate-data)
    client_key             = base64decode(local.kubeconfig_yaml.users[0].user.client-key-data)
  }
}

provider "kubernetes" {
  host                   = local.kubeconfig_yaml.clusters[0].cluster.server
  cluster_ca_certificate = base64decode(local.kubeconfig_yaml.clusters[0].cluster.certificate-authority-data)
  client_certificate     = base64decode(local.kubeconfig_yaml.users[0].user.client-certificate-data)
  client_key             = base64decode(local.kubeconfig_yaml.users[0].user.client-key-data)
}

provider "grafana" {
  url  = "https://grafana.kub.cestquilepro.inserjeunes.beta.gouv.fr/"
  auth = "admin:${var.monitoring_admin_password}"
}

