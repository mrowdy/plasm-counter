output "table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.counter.name
}

output "table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.counter.arn
}

output "lambda_iam_policy_json" {
  description = "IAM policy JSON for Lambda functions to access the counter table"
  value       = data.aws_iam_policy_document.lambda_dynamodb_policy.json
}
