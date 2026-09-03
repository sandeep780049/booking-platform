import express from "express";

import { getTerms, createTerms, updateTerms, saveDraft, publishTerms, restoreVersion, deleteVersion, getAllTermDocuments, getLiveTerms } from "../controllers/terms.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { languageMiddleware } from "../middlewares/language.middleware.js";

const router = express.Router();

// Public route for live terms (no authentication required)
router.get('/public/live', languageMiddleware, getLiveTerms);

// All other routes require admin authentication and language detection
router.use(verifyJWT);
router.use(verifyAdmin); // Ensure verifyAdmin is used if all are admin-only
router.use(languageMiddleware);

router.get("/all", getAllTermDocuments); // Get all term documents (irrespective of title or status)
router.get('/latest', getLiveTerms); // Get latest published terms (expects ?title=queryParam)
router.get("/", getTerms); // Get current, draft, and history (expects ?title=queryParam)
router.post("/create", createTerms); // Create new terms document
router.put("/update", updateTerms); // Update existing terms document (creates new draft)
router.post("/draft", saveDraft); // Save or update draft (expects title in body) - legacy
router.post("/publish", publishTerms); // Publish new version (expects title in body)
router.post("/restore/:version", restoreVersion); // Restore previous version as draft (expects ?title=queryParam)
router.delete("/:version", deleteVersion); // Delete a version (expects ?title=queryParam)

export default router;
