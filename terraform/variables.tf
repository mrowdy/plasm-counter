variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-central-1"
}

variable "table_name" {
  description = "Name of the counter table"
  type        = string
  default     = "plasm-counter"
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}

variable "ecr_repository_name" {
  description = "Name of the ECR repository for backend Docker images"
  type        = string
  default     = "plasm-backend"
}

variable "ecr_image_limit" {
  description = "Number of Docker images to keep in ECR repository"
  type        = number
  default     = 5
}

variable "lambda_function_prefix" {
  description = "Prefix for Lambda function names"
  type        = string
  default     = "plasm"
}

variable "lambda_image_tag" {
  description = "Docker image tag to use for Lambda functions"
  type        = string
  default     = "latest"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 10
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}
