// src/models/Testimonial.js

import mongoose from 'mongoose'; // 💡 Change: Use ES Module import

const TestimonialSchema = new mongoose.Schema({
    // Content of the testimonial
    content: {
        type: String,
        required: [true, 'Testimonial content is required.'],
        trim: true,
        maxlength: [500, 'Content cannot be more than 500 characters.']
    },
    // User information
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: String, // URL or path to the user's avatar

    // Status of the testimonial
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested'],
        default: 'pending'
    },
    // Admin-related fields
    adminNotes: {
        type: String,
        default: ''
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User' // Admin User ID
    },
    
    // Dates
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,

});

// Middleware to update the 'updatedAt' field on save
TestimonialSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// 💡 Change: Use ES Module default export
export default mongoose.model('Testimonial', TestimonialSchema);