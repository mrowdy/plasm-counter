variable "function_name_prefix" {
  description = "Prefix for Lambda function names"
  type        = string
  default     = "counter"
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository containing the Lambda function image"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to use for Lambda functions"
  type        = string
  default     = "latest"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB counter table"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB counter table"
  type        = string
}

variable "dynamodb_iam_policy_json" {
  description = "IAM policy JSON document for DynamoDB access"
  type        = string
}

variable "aws_region" {
  description = "AWS region where resources are deployed"
  type        = string
}

variable "timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 10
}

variable "memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}

variable "tags" {
  description = "Additional tags for Lambda resources"
  type        = map(string)
  default     = {}
}
