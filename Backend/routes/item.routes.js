import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { languageMiddleware } from '../middlewares/language.middleware.js';
import { getItemById, discoverItems, createItem, updateItem, deleteItem, getAllItems } from '../controllers/item.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Apply language middleware to all routes that need translation
router.get('/discover', languageMiddleware, discoverItems);
router.post('/upload', verifyJWT, upload.fields([
    {
        name: 'images',
        maxCount: 5
    },
]), createItem);
router.get('/', languageMiddleware, getAllItems);

router.route('/:id')
    .get(languageMiddleware, getItemById)
    .put(verifyJWT, upload.fields([
        {
            name: 'images',
            maxCount: 5
        },
    ]), updateItem)
    .delete(verifyJWT, deleteItem);
    
export default router;


