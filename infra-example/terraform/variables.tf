variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "ministack_endpoint" {
  description = "MiniStack local endpoint"
  type        = string
  default     = "http://localhost:4566"
}

variable "app_name" {
  description = "Application name prefix for all resources"
  type        = string
  default     = "infra-example"
}

variable "db_name" {
  description = "RDS database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "appuser"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  default     = "apppassword"
  sensitive   = true
}
