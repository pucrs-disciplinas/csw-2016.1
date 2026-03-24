import { Request, Response } from "express";

import { productInputSchema, productUpdateSchema } from "../models/product";
import {
  createProduct,
  deleteProductById,
  getProductById,
  listProducts,
  updateProductById
} from "../services/productService";

function isConditionalCheckFailedError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConditionalCheckFailedException"
  );
}

export async function createProductController(req: Request, res: Response) {
  const parsed = productInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados invalidos para cadastro de produto",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const created = await createProduct(parsed.data);
    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar produto" });
  }
}

export async function listProductsController(_req: Request, res: Response) {
  try {
    const products = await listProducts();
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar produtos" });
  }
}

export async function getProductByIdController(req: Request, res: Response) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar produto" });
  }
}

export async function updateProductByIdController(req: Request, res: Response) {
  const parsed = productUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados invalidos para atualizacao do produto",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const updated = await updateProductById(req.params.id, parsed.data);

    if (!updated) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    return res.json(updated);
  } catch (error) {
    if (isConditionalCheckFailedError(error)) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar produto" });
  }
}

export async function deleteProductByIdController(req: Request, res: Response) {
  try {
    await deleteProductById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (isConditionalCheckFailedError(error)) {
      return res.status(404).json({ message: "Produto nao encontrado" });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao remover produto" });
  }
}