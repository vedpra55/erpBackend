import express from "express";
import purchaseOrderRoute from "./purchaseOrder.route.js";
import stockTransferRoute from "./stockTransfer.route.js";

const app = express();

app.use("/purchaseOrder", purchaseOrderRoute);
app.use("/stockTransfer", stockTransferRoute);

export default app;
