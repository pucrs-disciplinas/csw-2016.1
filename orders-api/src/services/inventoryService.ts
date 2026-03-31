import { env } from "../config/env";
import { InventoryProduct } from "../models/order";

export class InventoryApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "InventoryApiError";
  }
}

export async function fetchProductById(productId: string): Promise<InventoryProduct | null> {
  const response = await fetch(`${env.INVENTORY_API_BASE_URL}/products/${productId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new InventoryApiError("Falha ao consultar inventory-api", 502);
  }

  const body = (await response.json()) as Partial<InventoryProduct>;

  if (!body.id || typeof body.stock !== "number" || !body.name) {
    throw new InventoryApiError("Resposta invalida da inventory-api", 502);
  }

  return {
    id: body.id,
    name: body.name,
    stock: body.stock
  };
}
