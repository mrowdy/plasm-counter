output "api_gateway_url" {
  description = "Base URL of the deployed API Gateway (prod stage)"
  value       = "${aws_api_gateway_stage.prod.invoke_url}"
}

output "function_arns" {
  description = "ARNs of all Lambda functions"
  value = [
    aws_lambda_function.get_count.arn,
    aws_lambda_function.increment.arn,
    aws_lambda_function.decrement.arn
  ]
}

output "function_names" {
  description = "Names of all Lambda functions"
  value = {
    get_count = aws_lambda_function.get_count.function_name
    increment = aws_lambda_function.increment.function_name
    decrement = aws_lambda_function.decrement.function_name
  }
}
