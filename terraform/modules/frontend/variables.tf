variable "bucket_name_prefix" {
  description = "Prefix for the S3 bucket name (must be globally unique)"
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_All, PriceClass_200, PriceClass_100)"
  type        = string
  default     = "PriceClass_100" # Use only North America and Europe edge locations (cheapest)
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
