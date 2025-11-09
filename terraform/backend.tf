# Remote backend configuration for Terraform state
# State is stored in S3 with DynamoDB for locking

terraform {
  backend "s3" {
    bucket         = "plasm-counter-tfstate-263867317840"
    key            = "terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "plasm-counter-terraform-lock"
    encrypt        = true
  }
}
