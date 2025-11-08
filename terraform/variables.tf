variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-central-1"
}

variable "table_name" {
  description = "Name of the counter table"
  type        = string
  default     = "dev-counter"
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
