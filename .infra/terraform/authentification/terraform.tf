terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38.0"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.19.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0.2"
    }
  }

  required_version = "~> 1.3"
}

