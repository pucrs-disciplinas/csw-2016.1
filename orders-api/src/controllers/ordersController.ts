import { Request, Response } from "express";

import { orderInputSchema } from "../models/order";
import { createOrder, getOrderById, OrderValidationError } from "../services/orderService";

export async function createOrderController(req: Request, res: Response) {
  const parsed = orderInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados invalidos para criacao de pedido",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  try {
    const created = await createOrder(parsed.data);
    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Erro ao criar pedido" });
  }
}

export async function getOrderByIdController(req: Request, res: Response) {
  try {
    const order = await getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Pedido nao encontrado" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar pedido" });
  }
}