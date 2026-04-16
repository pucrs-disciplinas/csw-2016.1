output "s3_files_bucket" {
  description = "S3 bucket for application files"
  value       = aws_s3_bucket.app_files.id
}

output "s3_frontend_bucket" {
  description = "S3 bucket for frontend static assets"
  value       = aws_s3_bucket.frontend.id
}

output "dynamodb_table" {
  description = "DynamoDB sessions table name"
  value       = aws_dynamodb_table.sessions.name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_db_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "ec2_public_ip" {
  description = "EC2 backend public IP"
  value       = aws_instance.backend.public_ip
}

output "ec2_public_dns" {
  description = "EC2 backend public DNS"
  value       = aws_instance.backend.public_dns
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}
