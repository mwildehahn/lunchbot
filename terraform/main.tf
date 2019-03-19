provider "aws" {
  version = "~> 2.0"
  profile = "${var.aws_profile}"
  region  = "${var.aws_region}"
}

resource "aws_dynamodb_table" "team" {
  name     = "${var.team_table_name}"
  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  billing_mode = "PAY_PER_REQUEST"

  tags {
    Environment = "${var.environment}"
  }
}

resource "aws_dynamodb_table" "user" {
  name      = "${var.user_table_name}"
  hash_key  = "team_id"
  range_key = "id"

  attribute {
    name = "team_id"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  billing_mode = "PAY_PER_REQUEST"

  tags {
    Environment = "${var.environment}"
  }
}

resource "aws_iam_user" "api" {
  name = "lunchbot-api-${var.environment}"
  path = "/${var.environment}/"
}

resource "aws_iam_access_key" "api" {
  user    = "${aws_iam_user.api.name}"
  pgp_key = "keybase:mhahn"
}

resource "aws_iam_user_policy" "api" {
  name = "lunchbot-api-db-${var.environment}"
  user = "${aws_iam_user.api.name}"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Effect": "Allow",
            "Resource": "${aws_dynamodb_table.team.arn}"
        },
        {
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:Query",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem"
            ],
            "Effect": "Allow",
            "Resource": "${aws_dynamodb_table.user.arn}"
        }
    ]
}
EOF
}

output "api.access_key_id" {
  value = "${aws_iam_access_key.api.id}"
}

output "api.secret_access_key" {
  value = "${aws_iam_access_key.api.encrypted_secret}"
}
