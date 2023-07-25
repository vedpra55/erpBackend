import express from "express";
import {
  createSubCompany,
  editSubCompany,
  getSubCompanyById,
  getSubCompanyOfCompany,
} from "../../controllers/system/subCompany.controller.js";
import {
  verifyAdminToken,
  verifyToken,
} from "../../middlewares/auth.middleware.js";
const router = express.Router();

// Admin route
router.post("/", verifyAdminToken, createSubCompany);
router.put("/", verifyToken, editSubCompany);
router.get("/", verifyToken, getSubCompanyOfCompany);
router.get("/id", verifyToken, getSubCompanyById);

export default router;
