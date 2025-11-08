resource "aws_ecr_repository" "backend" {
  name                 = var.repository_name
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  tags = merge(
    {
      Name        = var.repository_name
      Project     = "plasm-counter"
      Environment = "production"
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.image_limit} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.image_limit
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
