// src/controllers/testimonialController.js (UPDATED)

import Testimonial from '../models/Testimonial.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

// --- HELPER FUNCTION ---

/**
 * @desc Helper function to update testimonial status or content.
 * This function is versatile for both direct status changes (approve/revert) and content edits.
 */
const updateTestimonialData = async (id, updateFields, req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid testimonial ID.' });
        }

        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found' });
        }

        // Apply fields from updateFields
        Object.assign(testimonial, updateFields);
        
        // If status is being changed, record the admin who performed the action
        if (updateFields.status) {
            testimonial.approvedBy = req.user.id;
        }

        testimonial.updatedAt = Date.now();
        await testimonial.save();

        res.status(200).json({
            success: true,
            data: testimonial,
            message: updateFields.status 
                ? `Testimonial status updated to '${updateFields.status}'.`
                : 'Testimonial updated successfully.'
        });
    } catch (err) {
        console.error("Error in updateTestimonialData:", err);
        // Handle Mongoose Validation Errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error during update' });
    }
};

// --- ROUTE HANDLERS (CRUD & Actions) ---

/**
 * @desc Get all APPROVED testimonials for public display
 * @route GET /api/public/testimonials/approved
 * @access Public
 */
const getApprovedTestimonials = async (req, res) => {
    try {
        // Find only approved and select public-facing fields
        const testimonials = await Testimonial.find({ status: 'approved' })
            .select('content userName role rating userAvatar submittedAt')
            .sort({ submittedAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            testimonials,
            count: testimonials.length,
        });
    } catch (err) {
        console.error("Public Fetch Error:", err);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error while fetching public testimonials.'
        });
    }
};

/**
 * @desc Get all testimonials (admin view)
 * @route GET /api/testimonials
 * @access Private (Admin only)
 */
const getTestimonials = async (req, res) => {
    try {
        // Allows filtering by status via query param (e.g., ?status=pending)
        const filter = req.query.status && req.query.status !== 'all'
            ? { status: req.query.status }
            : {};

        const testimonials = await Testimonial.find(filter)
            .sort({ status: 1, submittedAt: -1 })
            .populate('user', 'email firstName lastName');

        res.status(200).json({
            success: true,
            testimonials,
            count: testimonials.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error fetching testimonials' });
    }
};

/**
 * @desc Submit a new testimonial
 * @route POST /api/testimonials
 * @access Private (Authenticated User)
 */
const submitTestimonial = async (req, res) => {
    try {
        const { content, role, rating } = req.body;

        const newTestimonial = await Testimonial.create({
            content,
            role,
            rating,
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userAvatar: req.user.avatarUrl || '',
            status: 'pending' // Always defaults to pending
        });

        res.status(201).json({ success: true, data: newTestimonial });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error during submission' });
    }
};

/**
 * @desc Update a testimonial (Admin editing content OR changing status)
 * @route PUT /api/testimonials/:id
 * @access Private (Admin only)
 */
const updateTestimonial = async (req, res) => {
    // The client store calls this route for both status changes (like 'revertToPending') 
    // and potentially content edits.
    const updateFields = req.body; // e.g., { status: 'approved', adminNotes: '...' } OR { content: '...', rating: 5 }
    await updateTestimonialData(req.params.id, updateFields, req, res);
};

/**
 * @desc Delete a testimonial
 * @route DELETE /api/testimonials/:id
 * @access Private (Admin only)
 */
const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404));
        }

        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        next(error);
    }
};


// --- FINAL EXPORT ---

const TestimonialController = {
    getTestimonials,
    getApprovedTestimonials,
    submitTestimonial,
    updateTestimonial,
    deleteTestimonial,
};

export default TestimonialController;