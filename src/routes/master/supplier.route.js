import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
  createSupplier,
  getAllSupplier,
  getSingleSupplier,
  updateSupplier,
} from "../../controllers/master/supplier.controller.js";

const router = express.Router();

router.post("/", verifyToken, createSupplier);
router.put("/", verifyToken, updateSupplier);
router.get("/", verifyToken, getAllSupplier);
router.get("/id", verifyToken, getSingleSupplier);

export default router;
