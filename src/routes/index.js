import express from "express";
import systemRoutes from "./system/system.route.js";
import masterRoutes from "./master/master.route.js";
import transactionRoutes from "./transaction/transaction.route.js";
import reportRoutes from "./report/report.route.js";

const app = express();

app.use("/system", systemRoutes);
app.use("/master", masterRoutes);
app.use("/transaction", transactionRoutes);
app.use("/report", reportRoutes);

export default app;
