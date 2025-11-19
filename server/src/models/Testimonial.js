// src/models/Testimonial.js

import mongoose from 'mongoose'; 

const TestimonialSchema = new mongoose.Schema({
    // Content of the testimonial
    content: {
        type: String,
        required: [true, 'Testimonial content is required.'],
        trim: true,
        maxlength: [500, 'Content cannot be more than 500 characters.']
    },
    
    // 💡 NEW FIELD: Descriptive Role/Title (e.g., "CSE Passer")
    role: {
        type: String,
        default: 'Verified Learner',
        required: true,
        trim: true,
    },
    
    // 💡 NEW FIELD: Star Rating
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },

    // User information
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: String,

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
        ref: 'User'
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

export default mongoose.model('Testimonial', TestimonialSchema);