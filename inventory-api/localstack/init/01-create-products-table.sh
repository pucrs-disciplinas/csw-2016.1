#!/bin/sh
set -e

TEMPLATE_FILE="/etc/localstack/init/ready.d/cloudformation/products-table.yml"
STACK_NAME="products-table"

awslocal cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --no-fail-on-empty-changeset \
  >/dev/null 2>&1

echo "Tabela products provisionada via CloudFormation no LocalStack"
