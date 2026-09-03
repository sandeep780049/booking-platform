import express from "express";
import {
  getAllAdventure,
  createAdventure,
  updateAdventure,
  deleteAdventure,
  getAdventure,
  getInstructorAdventures,
  getFilteredAdventures,
} from "../controllers/adventure.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";

const adventureRoute = express.Router();

// Apply language middleware to all routes
adventureRoute.use(languageMiddleware);

adventureRoute.get("/all", getAllAdventure);
adventureRoute.post(
  "/create",
  verifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
    { name: "medias", maxCount: 4 },
  ]),
  createAdventure
);

adventureRoute.get("/instructor", verifyJWT, getInstructorAdventures);

adventureRoute.get("/filter", getFilteredAdventures);
adventureRoute.put(
  "/:id",
  verifyJWT,
  upload.fields([
    {
      name: "medias",
      maxCount: 4,
    },
  ]),
  updateAdventure
);

adventureRoute.delete("/:id", verifyJWT, deleteAdventure);
adventureRoute.get("/:id", getAdventure);

export default adventureRoute;
