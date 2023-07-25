import express from "express";
import {
  createRole,
  getRoleByCompany,
  updateRoleProgramAccess,
  updetUserRole,
} from "../../controllers/system/role.controller.js";
import { verifyAdminToken } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", verifyAdminToken, createRole);
router.put("/", verifyAdminToken, updetUserRole);
router.get("/", verifyAdminToken, getRoleByCompany);
router.put(
  "/updateRoleProgramAccess",
  verifyAdminToken,
  updateRoleProgramAccess
);

export default router;
