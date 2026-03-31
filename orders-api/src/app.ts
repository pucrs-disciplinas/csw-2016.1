import cors from "cors";
import express from "express";

import { ordersRouter } from "./routes/orders";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ status: "ok", service: "pc-parts-orders-api" });
});

app.use("/orders", ordersRouter);
