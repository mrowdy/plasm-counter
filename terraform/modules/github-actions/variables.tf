variable "user_name" {
  description = "Name of the IAM user for GitHub Actions"
  type        = string
  default     = "github-actions-plasm"
}

variable "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  type        = string
}

variable "lambda_function_arns" {
  description = "List of Lambda function ARNs to allow updates"
  type        = list(string)
}

variable "frontend_s3_bucket_arn" {
  description = "ARN of the frontend S3 bucket"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  type        = string
}

variable "terraform_state_bucket_arn" {
  description = "ARN of the S3 bucket for Terraform state"
  type        = string
}

variable "terraform_lock_table_arn" {
  description = "ARN of the DynamoDB table for Terraform state locking"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
