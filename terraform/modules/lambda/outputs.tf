output "api_gateway_url" {
  description = "Base URL of the deployed API Gateway (prod stage)"
  value       = "${aws_api_gateway_stage.prod.invoke_url}"
}
