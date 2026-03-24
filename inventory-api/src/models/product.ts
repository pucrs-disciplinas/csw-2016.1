import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  brand: z.string().min(2),
  category: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  description: z.string().max(500).optional()
});

export const productUpdateSchema = productInputSchema.partial();

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export type Product = ProductInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};