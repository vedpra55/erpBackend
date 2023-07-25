import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { purchaseOrderPdf } from "../../controllers/report/purchaseOrderReport.controller.js";
import { PurchaseOrderSummaryPdf } from "../../controllers/report/orderSummary.controller.js";
import { StockLevelReport } from "../../controllers/report/stockLevelReport.js";

const router = express.Router();

router.get("/purchaseDocument", verifyToken, purchaseOrderPdf);
router.post("/purchaseOrderSummary", verifyToken, PurchaseOrderSummaryPdf);
router.post("/stockLevelReport", verifyToken, StockLevelReport);

export default router;
