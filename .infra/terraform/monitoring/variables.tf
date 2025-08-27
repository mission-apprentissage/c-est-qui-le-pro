variable "monitoring_host" {
  type        = string
  description = "Host for grafana"
}

variable "monitoring_admin_password" {
  type        = string
  description = "Admin password for grafana"
  sensitive   = true
}

variable "cluster_name" {
  description = "Cluster name"
  type        = string
  default     = "CQLP"
}
