import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
  createDepartment,
  getAllDepartment,
  getSingleDepartment,
  updateDepartment,
} from "../../controllers/master/department.controller.js";

const router = express.Router();

router.post("/", verifyToken, createDepartment);
router.get("/", verifyToken, getAllDepartment);
router.get("/id", verifyToken, getSingleDepartment);
router.put("/", verifyToken, updateDepartment);

export default router;
