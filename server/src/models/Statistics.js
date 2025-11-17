import mongoose from 'mongoose';

// Defines the schema for the static site statistics document.
const statSchema = new mongoose.Schema({
    // Using Strings to accommodate numbers with formatting (e.g., "4,100+")
    averagePassRate: {
        type: String,
        required: true,
        default: "17.22%", 
    },
    previlaceUserPassRate: {
        type: String,
        required: true,
        default: "85%",
    },
    successfulStudents: {
        type: String,
        required: true,
        default: "3,000+",
    },
    governmentJobsMatched: {
        type: String,
        required: true,
        default: "500+",
    },
    // Timestamp for tracking when the document was last updated
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
});

const Stat = mongoose.model('Stat', statSchema);
export default Stat;