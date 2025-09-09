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

variable "slack_oauth" {
  description = "Slack OAuth"
  type        = string
  sensitive   = true
}

variable "slack_channel" {
  description = "Slack channel"
  type        = string
}
