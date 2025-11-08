variable "table_name" {
  description = "Name of the table for storing the counter"
  type        = string
  default     = "dev-counter"
}

variable "tags" {
  description = "Additional tags to apply to the counter table"
  type        = map(string)
  default     = {}
}
