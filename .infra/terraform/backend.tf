terraform {
  backend "s3" {
    endpoints = {
      s3 = "https://s3.gra.perf.cloud.ovh.net/"
    }
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}
