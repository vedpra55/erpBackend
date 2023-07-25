import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
  createProduct,
  getAllProductSuppliers,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../../controllers/master/product.controller.js";

const router = express.Router();

router.post("/", verifyToken, createProduct);
router.put("/", verifyToken, updateProduct);
router.get("/", verifyToken, getAllProducts);
router.get("/id", verifyToken, getProductById);
router.get("/suppliers", verifyToken, getAllProductSuppliers);

export default router;
