import express from "express";
import {
  createPurchaseOrder,
  getAllPurhcaseOrder,
  getSinglePurchaseOrder,
  handleOrderFullFill,
  handlePayment,
} from "../../controllers/transaction/purchaseOrder.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createPurchaseOrder);
router.get("/", verifyToken, getAllPurhcaseOrder);
router.put("/fullFill", verifyToken, handleOrderFullFill);
router.post("/payment", verifyToken, handlePayment);
router.get("/id", verifyToken, getSinglePurchaseOrder);

export default router;
