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

variable "ecr_repository_name" {
  description = "Name of the ECR repository for backend Docker images"
  type        = string
  default     = "counter-backend"
}

variable "ecr_image_limit" {
  description = "Number of Docker images to keep in ECR repository"
  type        = number
  default     = 5
}
