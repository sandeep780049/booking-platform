import express from 'express';
import { createSponsor, listSponsors, updateSponsor, deleteSponsor } from '../controllers/sponsor.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Public list (optional) - if should be public keep GET at top without auth
router.get('/', listSponsors);

// Admin protected
router.use(verifyJWT);
router.use(verifyAdmin);

router.post('/', upload.single('logo'), createSponsor);
router.put('/:id', upload.single('logo'), updateSponsor);
router.delete('/:id', deleteSponsor);

export default router;