// src/controllers/testimonialController.js (FINALIZED)

import Testimonial from '../models/Testimonial.js';
import { AppError } from '../utils/AppError.js'; 

// Helper function to update status and notes
const updateTestimonialStatus = async (id, status, adminNotes, req, res) => {
    try {
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            return res.status(404).json({ success: false, error: 'Testimonial not found' });
        }

        testimonial.status = status;
        testimonial.adminNotes = adminNotes;
        testimonial.approvedBy = req.user.id; 

        await testimonial.save();

        res.status(200).json({
            success: true,
            data: testimonial,
            message: `Testimonial status updated to '${status}'.`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error during status update' });
    }
};

// --- ROUTE HANDLERS ---

/**
 * @desc    Get all APPROVED testimonials for public display
 * @route   GET /api/public/testimonials
 * @access  Public
 */
const getApprovedTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ status: 'approved' })
            .select('content userName userAvatar submittedAt') 
            .sort({ submittedAt: -1 })
            .limit(10); 

        res.status(200).json({
            success: true,
            testimonials,
            count: testimonials.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error fetching approved testimonials' });
    }
};

/**
 * @desc    Get all testimonials (admin view)
 * @route   GET /api/testimonials
 * @access  Private (Admin only)
 */
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({})
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
 * @desc    Approve a testimonial
 * @route   POST /api/testimonials/:id/approve
 * @access  Private (Admin only)
 */
const approveTestimonial = async (req, res) => { // 💡 ADDED DECLARATION
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'approved', notes, req, res);
};

/**
 * @desc    Reject a testimonial
 * @route   POST /api/testimonials/:id/reject
 * @access  Private (Admin only)
 */
const rejectTestimonial = async (req, res) => { // 💡 ADDED DECLARATION
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'rejected', notes, req, res);
};

/**
 * @desc    Request changes on a testimonial
 * @route   POST /api/testimonials/:id/request-changes
 * @access  Private (Admin only)
 */
const requestChanges = async (req, res) => { // 💡 ADDED DECLARATION
    const { notes } = req.body;
    await updateTestimonialStatus(req.params.id, 'changes_requested', notes, req, res);
};

/**
 * @desc    Submit a new testimonial
 * @route   POST /api/testimonials
 * @access  Private (Authenticated User)
 */
const submitTestimonial = async (req, res) => { // 💡 ADDED DECLARATION
    try {
        const { content } = req.body;
        
        const newTestimonial = await Testimonial.create({
            content,
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userAvatar: req.user.avatarUrl || '',
            status: 'pending'
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
 * @desc    Update a testimonial (Admin editing content)
 * @route   PUT /api/testimonials/:id
 * @access  Private (Admin only)
 */
const updateTestimonial = async (req, res, next) => {
    const { content, userName, role } = req.body;
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { content, userName, role, updatedAt: Date.now() },
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
 * @desc    Delete a testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Private (Admin only)
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


// 💡 FINAL FIX: Export the single default object 
// This object is now placed AFTER all function declarations, resolving the ReferenceError.
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