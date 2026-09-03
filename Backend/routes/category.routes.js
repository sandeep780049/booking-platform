import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js';
import { languageMiddleware } from '../middlewares/language.middleware.js';

const categoryRoute = express.Router();

// Apply language middleware to all routes
categoryRoute.use(languageMiddleware);

categoryRoute.route('/').get(getCategories).post(createCategory).delete(deleteCategory);

export default categoryRoute;