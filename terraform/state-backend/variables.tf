variable "aws_region" {
  description = "AWS region for the backend resources"
  type        = string
  default     = "eu-central-1"
}

variable "bucket_name_prefix" {
  description = "Prefix for the S3 bucket name (account ID will be appended for uniqueness)"
  type        = string
  default     = "plasm-counter-tfstate"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for state locking"
  type        = string
  default     = "plasm-counter-terraform-lock"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "plasm-counter"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
