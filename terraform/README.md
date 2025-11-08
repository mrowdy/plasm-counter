# Terraform Setup

Complete infrastructure for counter application.

## Usage

```bash
terraform init
terraform plan
terraform apply
```

## Configuration

Key variables:
- `aws_region` - AWS region (default: eu-central-1)
- `table_name` - DynamoDB table (default: plasm-counter)
- `ecr_repository_name` - ECR repository (default: plasm-backend)
- `lambda_image_tag` - Image tag (default: latest)

