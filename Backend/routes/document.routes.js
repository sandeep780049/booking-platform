import express from 'express';

import {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getDocumentByUserId,
} from '../controllers/document.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.route('/').get(getAllDocuments).post(upload.fields([
    {
        name: 'document',
        maxCount: 1,
    },
    {
        name: 'image',
        maxCount: 1,
    },
]), createDocument);

router.route('/:id').get(getDocumentById).put(updateDocument).delete(deleteDocument);
router.route('/user/:id').get(getDocumentByUserId);

export default router;