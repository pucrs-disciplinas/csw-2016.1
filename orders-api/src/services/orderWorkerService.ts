import {
  DeleteMessageCommand,
  GetQueueUrlCommand,
  Message,
  ReceiveMessageCommand
} from "@aws-sdk/client-sqs";

import { env } from "../config/env";
import { sqsClient } from "../config/sqs";
import { OrderCreatedEvent } from "../models/order";
import { fetchProductById } from "./inventoryService";
import { updateOrderStatus } from "./orderService";

function parseOrderCreatedEvent(message: Message): OrderCreatedEvent {
  if (!message.Body) {
    throw new Error("Mensagem SQS sem body");
  }

  const envelope = JSON.parse(message.Body) as { Message?: string };

  if (!envelope.Message) {
    throw new Error("Envelope SNS invalido: campo Message ausente");
  }

  return JSON.parse(envelope.Message) as OrderCreatedEvent;
}

async function updateInventoryStock(event: OrderCreatedEvent): Promise<void> {
  for (const item of event.items) {
    const product = await fetchProductById(item.productId);

    if (!product) {
      throw new Error(`Produto ${item.productId} nao encontrado ao processar pedido ${event.orderId}`);
    }

    const nextStock = product.stock - item.quantity;

    if (nextStock < 0) {
      throw new Error(
        `Estoque insuficiente ao processar pedido ${event.orderId} para produto ${item.productId}`
      );
    }

    const response = await fetch(`${env.INVENTORY_API_BASE_URL}/products/${item.productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stock: nextStock })
    });

    if (!response.ok) {
      throw new Error(`Falha ao atualizar estoque para produto ${item.productId}`);
    }
  }
}

async function resolveQueueUrl(): Promise<string> {
  if (env.SQS_ORDERS_QUEUE_URL) {
    return env.SQS_ORDERS_QUEUE_URL;
  }

  const result = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: env.SQS_ORDERS_QUEUE_NAME
    })
  );

  if (!result.QueueUrl) {
    throw new Error("Nao foi possivel resolver URL da fila de pedidos");
  }

  return result.QueueUrl;
}

export async function processOrdersQueueOnce(queueUrl: string): Promise<void> {
  const response = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 5,
      VisibilityTimeout: 30
    })
  );

  const messages = response.Messages ?? [];

  for (const message of messages) {
    if (!message.ReceiptHandle) {
      continue;
    }

    try {
      const event = parseOrderCreatedEvent(message);
      await updateInventoryStock(event);
      await updateOrderStatus(event.orderId, "PROCESSED");

      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle
        })
      );

      console.log(`Pedido ${event.orderId} processado e estoque atualizado`);
    } catch (error) {
      console.error("Erro ao processar mensagem da fila de pedidos", error);
    }
  }
}

export async function startOrdersWorker(): Promise<void> {
  const queueUrl = await resolveQueueUrl();
  console.log(`Worker iniciado. Consumindo fila: ${queueUrl}`);

  for (;;) {
    await processOrdersQueueOnce(queueUrl);
    await new Promise((resolve) => setTimeout(resolve, env.WORKER_POLL_INTERVAL_MS));
  }
}
