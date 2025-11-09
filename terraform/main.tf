terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources to reference state backend resources
data "aws_s3_bucket" "terraform_state" {
  bucket = "plasm-counter-tfstate-263867317840"
}

data "aws_dynamodb_table" "terraform_lock" {
  name = "plasm-counter-terraform-lock"
}

module "dynamodb" {
  source = "./modules/dynamodb"

  table_name = var.table_name
  tags       = var.tags
}

module "ecr" {
  source = "./modules/ecr"

  repository_name = var.ecr_repository_name
  image_limit     = var.ecr_image_limit
  tags            = var.tags
}

module "lambda" {
  source = "./modules/lambda"

  function_name_prefix      = var.lambda_function_prefix
  ecr_repository_url        = module.ecr.repository_url
  image_tag                 = var.lambda_image_tag
  dynamodb_table_name       = module.dynamodb.table_name
  dynamodb_table_arn        = module.dynamodb.table_arn
  dynamodb_iam_policy_json  = module.dynamodb.lambda_iam_policy_json
  aws_region                = var.aws_region
  timeout                   = var.lambda_timeout
  memory_size               = var.lambda_memory_size
  tags                      = var.tags

  depends_on = [module.ecr, module.dynamodb]
}

module "frontend" {
  source = "./modules/frontend"

  bucket_name_prefix     = var.frontend_bucket_prefix
  cloudfront_price_class = var.cloudfront_price_class
  tags                   = var.tags
}

module "github_actions" {
  source = "./modules/github-actions"

  user_name                    = "github-actions-plasm-backend"
  ecr_repository_arn           = module.ecr.repository_arn
  lambda_function_arns         = module.lambda.function_arns
  frontend_s3_bucket_arn       = module.frontend.s3_bucket_arn
  cloudfront_distribution_arn  = module.frontend.cloudfront_distribution_arn
  terraform_state_bucket_arn   = data.aws_s3_bucket.terraform_state.arn
  terraform_lock_table_arn     = data.aws_dynamodb_table.terraform_lock.arn
  tags                         = var.tags

  depends_on = [module.ecr, module.lambda, module.frontend]
}
