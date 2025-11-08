variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "counter-backend"
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the repository (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
  default     = true
}

variable "image_limit" {
  description = "Number of images to keep in the repository"
  type        = number
  default     = 5
}

variable "tags" {
  description = "Additional tags to apply to the ECR repository"
  type        = map(string)
  default     = {}
}
