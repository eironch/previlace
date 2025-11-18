import Stat from '../models/Statistics.js'; // Mongoose Model import

// Mongoose key names mapped to the user-friendly labels used by the frontend store
// This mapping is crucial for two-way transformation.
const STAT_LABELS_MAP = {
    averagePassRate: "Average CSE Pass Rate",
    previlaceUserPassRate: "Previlace User Pass Rate",
    successfulStudents: "Successful Students",
    governmentJobsMatched: "Government Jobs Matched",
};

/**
 * Utility function to ensure a single stats document exists.
 * If the collection is empty, it creates a document with defaults.
 */
const getOrCreateStats = async () => {
    // Attempt to find the single statistics document
    let stats = await Stat.findOne({});
    
    if (!stats) {
        // If not found, create it with default values
        console.log("Creating default statistics document.");
        stats = new Stat({});
        await stats.save();
    }
    return stats;
};

// @desc    Get all site statistics
// @route   GET /api/stats
// @access  Public (Used by the landing page KeyStatistics.jsx)
export const getStats = async (req, res) => {
    try {
        const stats = await getOrCreateStats();
        
        // FIX: Transform the flat Mongoose object into the ARRAY structure the frontend store expects.
        // The frontend expects [{ label: "...", number: "...", key: "..." }, ...]
        const dataArray = Object.keys(STAT_LABELS_MAP).map(key => ({
            key: key,
            number: stats[key], // Mongoose value
            label: STAT_LABELS_MAP[key] // The display label
        }));
        
        // Return the array directly, matching the expected output of fetchStatsFromApi
        res.json(dataArray); 
        
    } catch (error) {
        console.error("Server Error in getStats:", error);
        res.status(500).json({ success: false, error: 'Server Error: Cannot fetch stats.' });
    }
};

// @desc    Update site statistics (Admin function)
// @route   PUT /api/stats
// @access  Private (Used by the admin editor AdminStatsEditor.jsx)
export const updateStats = async (req, res) => {
    // NOTE: This endpoint receives an ARRAY of objects from the frontend's updateAdminStats()
    const statsArray = req.body;

    if (!Array.isArray(statsArray) || statsArray.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid data format provided. Expected a list of statistics.' });
    }
    
    // FIX: Transform the array received from the frontend back into a flat object 
    // that Mongoose's findOneAndUpdate can process.
    const updateObject = {};
    
    // Reverse map: find the Mongoose key (e.g., 'averagePassRate') from the label (e.g., 'Average CSE Pass Rate')
    const labelToKeyMap = Object.fromEntries(
        Object.entries(STAT_LABELS_MAP).map(([key, label]) => [label, key])
    );

    for (const stat of statsArray) {
        const key = labelToKeyMap[stat.label];
        if (key && stat.number !== undefined) {
            updateObject[key] = stat.number;
        }
    }

    if (Object.keys(updateObject).length === 0) {
        return res.status(400).json({ success: false, error: 'No recognizable statistics fields found in the update data.' });
    }

    try {
        // Find and update the *single* stats document
        const stats = await Stat.findOneAndUpdate({}, 
            { 
                ...updateObject, 
                lastUpdated: Date.now() 
            },
            { 
                new: true,         // Return the updated document
                upsert: true,      // Create the document if it doesn't exist
                runValidators: true // Run schema validation before saving
            }
        );

        res.json({
            success: true,
            message: 'Statistics updated successfully.',
            data: stats // Return the saved document
        });
    } catch (error) {
        console.error("Server Error in updateStats:", error);
        res.status(500).json({ success: false, error: 'Server Error: Cannot update stats.' });
    }
};