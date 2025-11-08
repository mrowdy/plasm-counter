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
