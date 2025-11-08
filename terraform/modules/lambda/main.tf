resource "aws_iam_role" "lambda_execution" {
  name               = "${var.function_name_prefix}-lambda-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-lambda-execution-role"
    }
  )
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_policy" "lambda_dynamodb" {
  name   = "${var.function_name_prefix}-lambda-dynamodb-policy"
  policy = var.dynamodb_iam_policy_json

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-lambda-dynamodb-policy"
    }
  )
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "get_count" {
  function_name = "${var.function_name_prefix}-get-count"
  role          = aws_iam_role.lambda_execution.arn
  package_type  = "Image"
  image_uri     = "${var.ecr_repository_url}:${var.image_tag}"
  timeout       = var.timeout
  memory_size   = var.memory_size

  image_config {
    command = ["handlers/getCount.handler"]
  }

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
      NODE_ENV   = "production"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-get-count"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_dynamodb,
    aws_iam_role_policy_attachment.lambda_logs,
  ]
}

resource "aws_lambda_function" "increment" {
  function_name = "${var.function_name_prefix}-increment"
  role          = aws_iam_role.lambda_execution.arn
  package_type  = "Image"
  image_uri     = "${var.ecr_repository_url}:${var.image_tag}"
  timeout       = var.timeout
  memory_size   = var.memory_size

  image_config {
    command = ["handlers/increment.handler"]
  }

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
      NODE_ENV   = "production"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-increment"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_dynamodb,
    aws_iam_role_policy_attachment.lambda_logs,
  ]
}

resource "aws_lambda_function" "decrement" {
  function_name = "${var.function_name_prefix}-decrement"
  role          = aws_iam_role.lambda_execution.arn
  package_type  = "Image"
  image_uri     = "${var.ecr_repository_url}:${var.image_tag}"
  timeout       = var.timeout
  memory_size   = var.memory_size

  image_config {
    command = ["handlers/decrement.handler"]
  }

  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table_name
      NODE_ENV   = "production"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-decrement"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_dynamodb,
    aws_iam_role_policy_attachment.lambda_logs,
  ]
}

resource "aws_api_gateway_rest_api" "counter_api" {
  name = "${var.function_name_prefix}-api"

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-api"
    }
  )
}

resource "aws_api_gateway_resource" "count" {
  rest_api_id = aws_api_gateway_rest_api.counter_api.id
  parent_id   = aws_api_gateway_rest_api.counter_api.root_resource_id
  path_part   = "count"
}

resource "aws_api_gateway_resource" "increment" {
  rest_api_id = aws_api_gateway_rest_api.counter_api.id
  parent_id   = aws_api_gateway_rest_api.counter_api.root_resource_id
  path_part   = "increment"
}

resource "aws_api_gateway_resource" "decrement" {
  rest_api_id = aws_api_gateway_rest_api.counter_api.id
  parent_id   = aws_api_gateway_rest_api.counter_api.root_resource_id
  path_part   = "decrement"
}

resource "aws_api_gateway_method" "get_count" {
  rest_api_id   = aws_api_gateway_rest_api.counter_api.id
  resource_id   = aws_api_gateway_resource.count.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_count" {
  rest_api_id             = aws_api_gateway_rest_api.counter_api.id
  resource_id             = aws_api_gateway_resource.count.id
  http_method             = aws_api_gateway_method.get_count.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_count.invoke_arn
}

resource "aws_api_gateway_method" "increment" {
  rest_api_id   = aws_api_gateway_rest_api.counter_api.id
  resource_id   = aws_api_gateway_resource.increment.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "increment" {
  rest_api_id             = aws_api_gateway_rest_api.counter_api.id
  resource_id             = aws_api_gateway_resource.increment.id
  http_method             = aws_api_gateway_method.increment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.increment.invoke_arn
}

resource "aws_api_gateway_method" "decrement" {
  rest_api_id   = aws_api_gateway_rest_api.counter_api.id
  resource_id   = aws_api_gateway_resource.decrement.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "decrement" {
  rest_api_id             = aws_api_gateway_rest_api.counter_api.id
  resource_id             = aws_api_gateway_resource.decrement.id
  http_method             = aws_api_gateway_method.decrement.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.decrement.invoke_arn
}

resource "aws_lambda_permission" "get_count" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_count.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.counter_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "increment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.increment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.counter_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "decrement" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.decrement.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.counter_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "counter_api" {
  rest_api_id = aws_api_gateway_rest_api.counter_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.count.id,
      aws_api_gateway_resource.increment.id,
      aws_api_gateway_resource.decrement.id,
      aws_api_gateway_method.get_count.id,
      aws_api_gateway_method.increment.id,
      aws_api_gateway_method.decrement.id,
      aws_api_gateway_integration.get_count.id,
      aws_api_gateway_integration.increment.id,
      aws_api_gateway_integration.decrement.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.get_count,
    aws_api_gateway_integration.increment,
    aws_api_gateway_integration.decrement,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.counter_api.id
  rest_api_id   = aws_api_gateway_rest_api.counter_api.id
  stage_name    = "prod"

  tags = merge(
    var.tags,
    {
      Name = "${var.function_name_prefix}-api-prod"
    }
  )
}
