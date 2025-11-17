import express from 'express';
// Note the .js extension for relative imports in ESM
import { getStats, updateStats } from '../controllers/statController.js'; 
const router = express.Router();

// Route for getting the statistics (Publicly accessible)
router.route('/')
    .get(getStats)
    
// Route for updating the statistics (Requires Admin Auth)
// NOTE: You would typically add an auth middleware here: router.route('/').put(protect, authorize('admin'), updateStats);
router.route('/')
    .put(updateStats); 

export default router;