terraform {
  required_providers {
    clevercloud = {
      source  = "CleverCloud/clevercloud"
      version = "0.10.0"
    }
  }
  backend "s3" {
    bucket                      = "lucas-backends-terraform"
    key                         = "cloud_clever/state/terraform.tfstate"
    region                      = "sbg" # Random us region not used for ovh backend
    endpoints                   = { s3 = "https://s3.sbg.io.cloud.ovh.net" }
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    use_path_style              = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

provider "clevercloud" {
}

resource "clevercloud_postgresql" "postgresql_database" {
  name   = "postgresql_database"
  plan   = "dev"
  region = "par"
}

resource "clevercloud_docker" "docker_instance" {
  name = "docker_instance"
  region = "par"

  # horizontal scaling
  min_instance_count = 1
  max_instance_count = 2

  # vertical scaling
  smallest_flavor = "XS"
  biggest_flavor  = "M"

  additional_vhosts = ["example.com"]
}
