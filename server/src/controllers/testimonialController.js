// src/controllers/testimonialController.js (FINALIZED & CORRECTED)

import Testimonial from '../models/Testimonial.js';
import { AppError } from '../utils/AppError.js'; 
import mongoose from 'mongoose'; // Needed for ObjectId checks, good practice

// --- HELPER FUNCTION ---

/**
 * @desc Helper function to update testimonial status, used by approve/reject/requestChanges
 */
const updateTestimonialStatus = async (id, status, adminNotes, req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid testimonial ID.' });
        }
        
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found' });
        }

        testimonial.status = status;
        testimonial.adminNotes = adminNotes;
        // Ensure admin ID is stored for accountability
        testimonial.approvedBy = req.user.id; 

        await testimonial.save();

        res.status(200).json({
            success: true,
            data: testimonial,
            message: `Testimonial status updated to '${status}'.`
        });
    } catch (err) {
        console.error("Error in updateTestimonialStatus:", err);
        res.status(500).json({ success: false, error: 'Server Error during status update' });
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
        // 🚨 FIX: Explicitly set 500 status and return JSON. 
        // This prevents the error from bubbling up to a generic HTML error handler.
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
        // ✅ CRITICAL FIX: Destructure role and rating from req.body
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
 * @desc Approve a testimonial
 */
const approveTestimonial = async (req, res) => {
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'approved', notes, req, res);
};

/**
 * @desc Reject a testimonial
 */
const rejectTestimonial = async (req, res) => {
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'rejected', notes, req, res);
};

/**
 * @desc Request changes on a testimonial
 */
const requestChanges = async (req, res) => {
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'changes_requested', notes, req, res);
};

/**
 * @desc Update a testimonial (Admin editing content)
 * @route PUT /api/testimonials/:id
 * @access Private (Admin only)
 */
const updateTestimonial = async (req, res, next) => {
    const { content, userName, role, rating } = req.body;
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { content, userName, role, rating, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!testimonial) {
            return next(new AppError('Testimonial not found', 404));
        }

        res.status(200).json({ success: true, data: testimonial });
    } catch (error) {
        next(error);
    }
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
    approveTestimonial,
    rejectTestimonial,
    requestChanges,
    submitTestimonial,
    updateTestimonial,
    deleteTestimonial,
};

export default TestimonialController;