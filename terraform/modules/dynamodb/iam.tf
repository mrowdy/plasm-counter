data "aws_iam_policy_document" "lambda_dynamodb_policy" {
  statement {
    sid    = "DynamoDBCounterAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.counter.arn
    ]
  }

  # PutItem intentionally excluded - all updates use UpdateItem with ConditionExpression for ACID guarantees
}
