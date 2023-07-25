import express from "express";
import { getCompanyById } from "../../controllers/system/company.controller.js";
const router = express.Router();

router.get("/", getCompanyById);

export default router;
