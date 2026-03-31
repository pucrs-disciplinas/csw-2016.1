import { z } from "zod";

export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export const orderInputSchema = z.object({
  items: z.array(orderItemInputSchema).min(1)
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type OrderInput = z.infer<typeof orderInputSchema>;

export type Order = {
  id: string;
  items: OrderItemInput[];
  status: "PENDING" | "PROCESSED" | "FAILED";
  createdAt: string;
};

export type InventoryProduct = {
  id: string;
  name: string;
  stock: number;
};

export type OrderCreatedEvent = {
  orderId: string;
  createdAt: string;
  items: OrderItemInput[];
};