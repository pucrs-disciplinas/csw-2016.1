import { Router } from "express";

import {
  createProductController,
  deleteProductByIdController,
  getProductByIdController,
  listProductsController,
  updateProductByIdController
} from "../controllers/productsController";

export const productsRouter = Router();

productsRouter.post("/", createProductController);
productsRouter.get("/", listProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.put("/:id", updateProductByIdController);
productsRouter.delete("/:id", deleteProductByIdController);
