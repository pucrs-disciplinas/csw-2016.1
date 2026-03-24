import cors from "cors";
import express from "express";

import { productsRouter } from "./routes/products";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ status: "ok", service: "pc-parts-products-api" });
});

app.use("/products", productsRouter);
