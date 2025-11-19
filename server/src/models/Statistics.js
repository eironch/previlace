import mongoose from 'mongoose';

/**
 * Defines the Mongoose Schema for the application's global statistics.
 * We assume only one document of this type will ever exist in the collection,
 * serving as a single source of truth for the public key metrics.
 */
const StatisticsSchema = new mongoose.Schema({
    // Store as strings to support non-numeric values like "12,000+" or "95%"
    
    averagePassRate: {
        type: String,
        required: [true, 'Please provide the average CSE pass rate.'],
        default: '85%'
    },
    previlaceUserPassRate: {
        type: String,
        required: [true, 'Please provide the privileged user pass rate.'],
        default: '92%'
    },
    successfulStudents: {
        type: String,
        required: [true, 'Please provide the successful students count.'],
        default: '12,000+'
    },
    governmentJobsMatched: {
        type: String,
        required: [true, 'Please provide the government jobs matched count.'],
        default: '3,500+'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    // Mongoose option to disable the automatic 'id' field for simpler single-document use
    _id: false 
});

// Export the Mongoose model
const Stat = mongoose.model('Statistic', StatisticsSchema);

export default Stat;