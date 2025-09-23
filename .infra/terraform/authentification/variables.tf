variable "github_client_id" {
  description = "GitHub OAuth App Client ID"
  type        = string
}

variable "github_client_secret" {
  description = "GitHub OAuth App Client Secret"
  type        = string
  sensitive   = true
}

variable "github_org" {
  description = "GitHub organization name"
  type        = string
}

variable "dex_domain" {
  description = "Domain for Dex (e.g., dex.example.com)"
  type        = string
}

variable "admin_users" {
  description = "List of GitHub usernames to grant cluster-admin access"
  type        = list(string)
  default     = []
}
