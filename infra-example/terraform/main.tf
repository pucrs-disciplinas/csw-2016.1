terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3         = var.ministack_endpoint
    dynamodb   = var.ministack_endpoint
    rds        = var.ministack_endpoint
    ec2        = var.ministack_endpoint
    cloudfront = var.ministack_endpoint
    iam        = var.ministack_endpoint
  }
}
