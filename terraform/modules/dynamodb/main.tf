resource "aws_dynamodb_table" "counter" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = merge(
    {
      Name        = var.table_name
      Project     = "plasm-counter"
      Environment = "production"
      ManagedBy   = "terraform"
    },
    var.tags
  )
}

resource "aws_dynamodb_table_item" "initial_counter" {
  table_name = aws_dynamodb_table.counter.name
  hash_key   = aws_dynamodb_table.counter.hash_key

  item = jsonencode({
    id      = { S = "global" }
    value   = { N = "0" }
    version = { N = "0" }
  })

  lifecycle {
    ignore_changes = [item]
  }
}
