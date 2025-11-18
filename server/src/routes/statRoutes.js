import express from 'express';
import { getStats, updateStats } from '../controllers/statsController.js';

const router = express.Router();

// Define the routes for the /api/stats endpoint

// @route   GET /api/stats
// @desc    Get all site statistics (Public)
// @access  Public
router.route('/').get(getStats);

// @route   PUT /api/stats
// @desc    Update site statistics (Admin)
// @access  Private/Admin (Authentication middleware should be added here in a real app)
// NOTE: We use PUT as configured in statsService.js
router.route('/').put(updateStats);


export default router;