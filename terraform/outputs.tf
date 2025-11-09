output "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = module.dynamodb.table_arn
}

output "lambda_iam_policy_json" {
  description = "IAM policy JSON for Lambda functions to access the counter table"
  value       = module.dynamodb.lambda_iam_policy_json
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "api_gateway_url" {
  description = "Base URL of the deployed API Gateway"
  value       = module.lambda.api_gateway_url
}

output "frontend_s3_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = module.frontend.s3_bucket_name
}

output "frontend_cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.frontend.cloudfront_distribution_id
}

output "frontend_website_url" {
  description = "Full HTTPS URL of the frontend website"
  value       = module.frontend.website_url
}
