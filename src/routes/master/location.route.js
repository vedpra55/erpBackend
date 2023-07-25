import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";

import {
  createLocation,
  getAllLocations,
  getSingleLocation,
  updateLocation,
} from "../../controllers/master/location.controller.js";

const router = express.Router();

router.post("/", verifyToken, createLocation);
router.get("/", verifyToken, getAllLocations);
router.get("/id", verifyToken, getSingleLocation);
router.put("/", verifyToken, updateLocation);

export default router;
