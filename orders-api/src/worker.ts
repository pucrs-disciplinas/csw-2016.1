import { startOrdersWorker } from "./services/orderWorkerService";

startOrdersWorker().catch((error) => {
  console.error("Falha fatal no worker de pedidos", error);
  process.exit(1);
});
