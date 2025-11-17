import Stat from '../models/Statistics.js'; // Note the .js extension for relative imports in ESM

// Utility function to ensure a single stats document exists (for first run)
const getOrCreateStats = async () => {
    let stats = await Stat.findOne();
    if (!stats) {
        // If the document doesn't exist, create it with defaults
        stats = new Stat({});
        await stats.save();
    }
    return stats;
};

// @desc    Get all site statistics
// @route   GET /api/stats
// @access  Public (Used by the landing page)
export const getStats = async (req, res) => {
    try {
        const stats = await getOrCreateStats();
        res.json({
            success: true,
            data: {
                averagePassRate: stats.averagePassRate,
                previlaceUserPassRate: stats.previlaceUserPassRate,
                successfulStudents: stats.successfulStudents,
                governmentJobsMatched: stats.governmentJobsMatched,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error: Cannot fetch stats.' });
    }
};

// @desc    Update site statistics (Admin function)
// @route   PUT /api/stats
// @access  Private (Requires admin authentication middleware)
export const updateStats = async (req, res) => {
    // NOTE: In a real app, you must add an authentication and authorization check here
    if (!req.body) {
        return res.status(400).json({ success: false, error: 'No data provided for update.' });
    }

    try {
        // Find and update the *single* stats document
        const stats = await Stat.findOneAndUpdate({}, 
            { 
                ...req.body, // Contains the new values from the admin form
                lastUpdated: Date.now() 
            },
            { 
                new: true, // Return the updated document
                upsert: true, // Create if not found
                runValidators: true 
            }
        );

        res.json({
            success: true,
            message: 'Statistics updated successfully.',
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error: Cannot update stats.' });
    }
};