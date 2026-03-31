export const env = {
  APP_PORT: 3001,
  NODE_ENV: "test",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "test",
  AWS_SECRET_ACCESS_KEY: "test",
  DYNAMODB_ENDPOINT: "http://localhost:4566",
  DYNAMODB_TABLE_NAME: "orders",
  SNS_ENDPOINT: "http://localhost:4566",
  SNS_ORDERS_TOPIC_ARN: "arn:aws:sns:us-east-1:000000000000:orders-created-topic",
  SNS_ORDERS_TOPIC_NAME: "orders-created-topic",
  SQS_ORDERS_QUEUE_URL: "http://localhost:4566/000000000000/orders-created-queue",
  SQS_ORDERS_QUEUE_NAME: "orders-created-queue",
  WORKER_POLL_INTERVAL_MS: 100,
  INVENTORY_API_BASE_URL: "http://localhost:3000"
};
