import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
  getCompanyProgram,
  getCompanyRoleProgram,
} from "../../controllers/system/program.controller.js";
const router = express.Router();

router.get("/", verifyToken, getCompanyProgram);
router.get("/role", verifyToken, getCompanyRoleProgram);

export default router;
