import { randomUUID } from "node:crypto";

import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { env } from "../config/env";
import { dynamoDocClient } from "../config/dynamo";
import { Product, ProductInput, ProductUpdate } from "../models/product";

const tableName = env.DYNAMODB_TABLE_NAME;

export async function createProduct(input: ProductInput): Promise<Product> {
  const now = new Date().toISOString();
  const product: Product = {
    id: randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now
  };

  await dynamoDocClient.send(
    new PutCommand({
      TableName: tableName,
      Item: product,
      ConditionExpression: "attribute_not_exists(id)"
    })
  );

  return product;
}

export async function listProducts(): Promise<Product[]> {
  const result = await dynamoDocClient.send(
    new ScanCommand({
      TableName: tableName
    })
  );

  return (result.Items as Product[] | undefined) ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await dynamoDocClient.send(
    new GetCommand({
      TableName: tableName,
      Key: { id }
    })
  );

  return (result.Item as Product | undefined) ?? null;
}

export async function updateProductById(
  id: string,
  updateData: ProductUpdate
): Promise<Product | null> {
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    return getProductById(id);
  }

  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString()
  };

  const setExpressions: string[] = ["updatedAt = :updatedAt"];

  for (const field of fields) {
    const nameKey = `#${field}`;
    const valueKey = `:${field}`;

    names[nameKey] = field;
    values[valueKey] = updateData[field as keyof ProductUpdate];
    setExpressions.push(`${nameKey} = ${valueKey}`);
  }

  const result = await dynamoDocClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { id },
      ConditionExpression: "attribute_exists(id)",
      UpdateExpression: `SET ${setExpressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW"
    })
  );

  return (result.Attributes as Product | undefined) ?? null;
}

export async function deleteProductById(id: string): Promise<boolean> {
  await dynamoDocClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { id },
      ConditionExpression: "attribute_exists(id)"
    })
  );

  return true;
}