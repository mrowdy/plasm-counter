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
