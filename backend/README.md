# Backend

Dockerized TypeScript Lambda functions with ACID guarantees.

## Build and Push to AWS

### 1. Build the Docker Image

```powershell
cd backend
docker build -t plasm-backend:latest .
```

### 2. Authenticate to AWS ECR

```powershell
# Get your AWS account ID
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

# Set your region (default: eu-central-1)
$AWS_REGION = "eu-central-1"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | `
  docker login --username AWS --password-stdin `
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

### 3. Tag and Push to ECR

```powershell
# Tag the image for ECR
docker tag plasm-backend:latest `
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/plasm-backend:latest"

# Push to ECR
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/plasm-backend:latest"
```

### 4. Deploy with Terraform

```powershell
cd ..\terraform

# Initialize Terraform (first time only)
terraform init

# Plan the deployment
terraform plan

# Apply the changes
terraform apply
```

## Local Test

```powershell
docker run -p 9000:8080 `
  -e AWS_REGION=eu-central-1 `
  -e TABLE_NAME=plasm-counter `
  plasm-backend:latest
```

## Test Lambda Functions on AWS

List Deployed Functions

```powershell
aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'plasm')].FunctionName" --output table
```

Test Get Count

```powershell
aws lambda invoke --function-name plasm-get-count --region eu-central-1 response.json; cat response.json
```

Test Increment

```powershell
aws lambda invoke --function-name plasm-increment --region eu-central-1 response.json; cat response.json
```

Test Decrement

```powershell
aws lambda invoke --function-name plasm-decrement --region eu-central-1 response.json; cat response.json
```

## Handlers

- `handlers/getCount.handler` - GET /count
- `handlers/increment.handler` - POST /increment
- `handlers/decrement.handler` - POST /decrement

## Running Tests

```bash
# Run all tests
npm test

# Run linter
npm run lint
```
