import { randomUUID } from "node:crypto";

import {
  CreateTopicCommand,
  PublishCommand
} from "@aws-sdk/client-sns";
import {
  GetCommand,
  PutCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { env } from "../config/env";
import { dynamoDocClient } from "../config/dynamo";
import { snsClient } from "../config/sns";
import { Order, OrderCreatedEvent, OrderInput } from "../models/order";
import { fetchProductById, InventoryApiError } from "./inventoryService";

const tableName = env.DYNAMODB_TABLE_NAME;


export class OrderValidationError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "OrderValidationError";
  }
}

async function resolveTopicArn(): Promise<string> {
  if (env.SNS_ORDERS_TOPIC_ARN) {
    return env.SNS_ORDERS_TOPIC_ARN;
  }

  const topic = await snsClient.send(
    new CreateTopicCommand({
      Name: env.SNS_ORDERS_TOPIC_NAME
    })
  );

  if (!topic.TopicArn) {
    throw new Error("Nao foi possivel resolver ARN do topico SNS");
  }

  return topic.TopicArn;
}

function aggregateItems(input: OrderInput): OrderInput["items"] {
  const grouped = new Map<string, number>();

  for (const item of input.items) {
    grouped.set(item.productId, (grouped.get(item.productId) ?? 0) + item.quantity);
  }

  return [...grouped.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const items = aggregateItems(input);

  for (const item of items) {
    try {
      const product = await fetchProductById(item.productId);

      if (!product) {
        throw new OrderValidationError(`Produto ${item.productId} nao encontrado`, 404);
      }

      if (product.stock < item.quantity) {
        throw new OrderValidationError(
          `Estoque insuficiente para ${product.name}. Disponivel: ${product.stock}`,
          409
        );
      }
    } catch (error) {
      if (error instanceof OrderValidationError) {
        throw error;
      }

      if (error instanceof InventoryApiError) {
        throw new OrderValidationError(error.message, error.statusCode);
      }

      throw error;
    }
  }

  const createdAt = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    items,
    status: "PENDING",
    createdAt
  };

  const event: OrderCreatedEvent = {
    orderId: order.id,
    createdAt,
    items
  };

  const topicArn = await resolveTopicArn();

  await snsClient.send(
    new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: "ORDER_CREATED"
        }
      }
    })
  );

  await dynamoDocClient.send(
    new PutCommand({
      TableName: tableName,
      Item: order,
      ConditionExpression: "attribute_not_exists(id)"
    })
  );

  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await dynamoDocClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { id }
    })
  );

  return (result.Item as Order | undefined) ?? null;
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  await dynamoDocClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id: orderId },
      ConditionExpression: "attribute_exists(id)",
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": status
      }
    })
  );
}