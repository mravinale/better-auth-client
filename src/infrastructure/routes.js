// infrastructure/routes.js
import express from 'express'; 
import { verifyToken } from '../middleware/authMiddleware.js';
import { getProtected, healthCheck } from '../controllers/mainController.js';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Protected endpoint
router.get('/protected', verifyToken, getProtected);

export default router;
