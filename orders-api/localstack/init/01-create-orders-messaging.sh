#!/bin/sh
set -e

TEMPLATE_FILE="/etc/localstack/init/ready.d/cloudformation/orders-messaging.yml"
STACK_NAME="orders-messaging"

awslocal cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --no-fail-on-empty-changeset \
  >/dev/null 2>&1

echo "Tabela DynamoDB, topico SNS e fila SQS de pedidos provisionados via CloudFormation no LocalStack"
