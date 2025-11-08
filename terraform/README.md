# Terraform Setup

DynamoDB counter table infrastructure.

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
- `tags` - Additional resource tags

