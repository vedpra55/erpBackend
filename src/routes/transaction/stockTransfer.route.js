import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
  acknowledgeStockTransfer,
  createStockTransfer,
  getAllStockTransfer,
  getSingleStockTransfer,
  getProductQtyFromStore,
} from "../../controllers/transaction/stockTransfer.controller.js";
const router = express.Router();

router.post("/", verifyToken, createStockTransfer);
router.put("/acknowledge", verifyToken, acknowledgeStockTransfer);
router.get("/", verifyToken, getAllStockTransfer);
router.get("/id", verifyToken, getSingleStockTransfer);
router.get("/storeQty", verifyToken, getProductQtyFromStore);

export default router;
