# Terraform Setup

DynamoDB counter table and ECR repository infrastructure.

## Usage

```bash
terraform init
terraform plan
terraform apply
```

## Configuration

Edit `variables.tf` to customize:
- `aws_region` - AWS region (default: eu-central-1)
- `table_name` - DynamoDB table name (default: dev-counter)
- `ecr_repository_name` - ECR repository name (default: counter-backend)
- `ecr_image_limit` - Number of images to keep (default: 5)
- `tags` - Additional resource tags

