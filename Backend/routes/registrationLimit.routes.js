import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  verifyAdmin,
  requirePermission,
} from "../middlewares/admin.middleware.js";
import { PERMISSIONS } from "../config/permissions.js";
import {
  createLimit,
  updateLimit,
  deleteLimit,
  getAllLimits,
  getLimitByAdventureLocation,
  moveFromWaitlist,
} from "../controllers/registrationLimit.controller.js";

const registrationLimitRouter = express.Router();

registrationLimitRouter.use(verifyJWT);
registrationLimitRouter.use(verifyAdmin);

registrationLimitRouter.post(
  "/",
  requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  createLimit,
);

registrationLimitRouter.put(
  "/:id",
  requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  updateLimit,
);

registrationLimitRouter.delete(
  "/:id",
  requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  deleteLimit,
);

registrationLimitRouter.get(
  "/",
  requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  getAllLimits,
);

registrationLimitRouter.get(
  "/:adventureId/:locationId",
  getLimitByAdventureLocation,
);

registrationLimitRouter.post(
  "/move-from-waitlist",
  requirePermission(PERMISSIONS.MANAGE_SETTINGS),
  moveFromWaitlist,
);

export default registrationLimitRouter;
