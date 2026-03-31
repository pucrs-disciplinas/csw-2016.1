import { Router } from "express";

import { createOrderController, getOrderByIdController } from "../controllers/ordersController";

export const ordersRouter = Router();

ordersRouter.post("/", createOrderController);
ordersRouter.get("/:id", getOrderByIdController);
