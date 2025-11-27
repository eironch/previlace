import React, { useEffect, useState, useMemo } from 'react';
import { useTestimonialsStore } from "@/store/testimonialsStore";
import { 
    CheckCircle, Clock, User, Star, AlertTriangle, 
    Loader2, RefreshCw, Heart // ⭐ Added Heart icon for 'Favorited' visual
} from 'lucide-react';
import Button from '@/components/ui/Button';

// ⭐ Define the maximum limit
const MAX_APPROVED_TESTIMONIALS = 3;

export default function TestimonialsManager({ landingPage = false }) {
    const { testimonials, isLoading, error, fetchTestimonials, approveTestimonial, revertToPending } = useTestimonialsStore();
    const [filterStatus, setFilterStatus] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [actionError, setActionError] = useState(null);

    // ⭐ Calculate the current count of approved testimonials
    const approvedCount = useMemo(() => {
        return testimonials.filter(t => t.status === 'approved').length;
    }, [testimonials]);

    // ⭐ Filtered list remains the same, but the logic now depends on the limit for the landing page
    const filteredTestimonials = useMemo(() => {
        if (landingPage) return testimonials.filter(t => t.status === 'approved').slice(0, MAX_APPROVED_TESTIMONIALS);
        if (filterStatus === 'all') return testimonials;
        return testimonials.filter(t => t.status === filterStatus);
    }, [testimonials, filterStatus, landingPage]);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleAction = async (testimonialId, actionType) => {
        setActionError(null);
        
        // ⭐ NEW LOGIC: Check the limit BEFORE approving
        if (actionType === 'approve' && approvedCount >= MAX_APPROVED_TESTIMONIALS) {
            setActionError(`Cannot approve more than ${MAX_APPROVED_TESTIMONIALS} testimonials. Please revert one first.`);
            return;
        }

        setActionLoading(actionType);
        try {
            switch (actionType) {
                case 'approve':
                    await approveTestimonial(testimonialId);
                    // The store update will trigger the useMemo recalculation
                    break;
                case 'revert':
                    await revertToPending(testimonialId);
                    break;
            }
        } catch (err) {
            // Note: If the backend returns a specific error (e.g., related to the limit, 
            // although we pre-check here), this will catch it.
            setActionError(err.message || `Action failed for ${actionType}.`);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = date => new Date(date).toLocaleDateString();

    const TestimonialRow = ({ testimonial }) => {
        const isPending = testimonial.status === 'pending';
        const isApproved = testimonial.status === 'approved';
        const isActionDisabled = actionLoading !== null;

        const StatusBadge = () => {
            let borderColor = 'border-gray-500';
            let textColor = 'text-gray-500';
            let statusText = testimonial.status.toUpperCase();

            if (testimonial.status === 'pending') {
                borderColor = 'border-gray-700';
                textColor = 'text-gray-700';
            } else if (testimonial.status === 'approved') {
                // ⭐ Change text to 'FAVORITED' or 'APPROVED' based on context/preference
                borderColor = 'border-black';
                textColor = 'text-black';
                statusText = 'FAVORITED'; // ⭐ Visual change for the approved state
            } 

            return (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${borderColor} ${textColor}`}>
                    {statusText}
                </span>
            );
        };

        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 transition-all duration-200 hover:shadow-md hover:border-gray-300">
                <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-3">
                    <div className="flex items-center space-x-3">
                        <User className="h-6 w-6 text-gray-700" />
                        <div>
                            <p className="font-semibold text-lg text-gray-900">{testimonial.userName || 'Anonymous User'}</p>
                            <p className="text-sm text-gray-500">{testimonial.role || 'No Role Specified'}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <StatusBadge />
                        <div className="flex items-center justify-end text-xs text-gray-500 mt-1 space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>Submitted: {formatDate(testimonial.submittedAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex mb-2">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </div>

                {actionError && (
                    <div className="p-3 border border-red-200 bg-red-50 text-sm text-red-700 rounded-md mb-4 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" /> {actionError}
                    </div>
                )}

                {!landingPage && (
                    <div className="flex space-x-3 pt-3 border-t border-gray-300">
                        {isPending && (
                            <Button 
                                onClick={() => handleAction(testimonial._id, 'approve')} 
                                disabled={isActionDisabled || approvedCount >= MAX_APPROVED_TESTIMONIALS} // ⭐ Disable if at limit
                                className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <Heart className="h-4 w-4 mr-2 text-red-500" /> 
                                {actionLoading === 'approve' ? 'Favoriting...' : 'Favorite for Display'}
                            </Button>
                        )}

                        {isApproved && (
                            <Button 
                                onClick={() => handleAction(testimonial._id, 'revert')} 
                                disabled={isActionDisabled} 
                                className="flex items-center border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            >
                                <Clock className="h-4 w-4 mr-2" /> Revert to Pending
                            </Button>
                        )}
                        
                        {/* ⭐ Display limit info near actions */}
                        <p className="text-sm text-gray-500 self-center ml-4">
                            Approved: {approvedCount}/{MAX_APPROVED_TESTIMONIALS}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // ... (isLoading and error rendering remains the same) ...

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <p className="ml-3 text-gray-600">Loading testimonials...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">Error loading data: {error}</p>
            <button onClick={fetchTestimonials} className="ml-auto text-sm text-red-500 hover:underline">
                <RefreshCw className="h-4 w-4 inline mr-1" /> Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {!landingPage && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                        Testimonials Management ({filteredTestimonials.length})
                        <span className="text-base font-medium text-gray-600">
                            (Display Limit: {approvedCount}/{MAX_APPROVED_TESTIMONIALS})
                        </span>
                        <button 
                            onClick={() => fetchTestimonials()} 
                            disabled={isLoading}
                            className="ml-auto flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200 active:scale-95"
                        >
                            <RefreshCw 
                                className="h-4 w-4" 
                                style={{ animation: isLoading ? "custom-spin 1s linear infinite" : "none" }}
                            />
                            Refresh
                        </button>
                    </h2>

                    {/* Filter dropdown */}
                    <div className="mb-4">
                        <label className="mr-2 font-semibold text-black">Filter Status:</label>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-black rounded px-2 py-1 text-black"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Favorited (Approved)</option>
                        </select>
                    </div>
                </>
            )}

            <div className="space-y-4">
                {filteredTestimonials.length > 0 ? (
                    filteredTestimonials.map(t => (
                        <TestimonialRow key={t._id} testimonial={t} />
                    ))
                ) : (
                    <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-lg text-gray-500">
                            {landingPage ? 'No favorite testimonials yet.' : `No ${filterStatus} testimonials found.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
