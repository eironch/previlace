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
                borderColor = 'bg-gray-100'; // Changed to match UserManagement style (no border, just bg)
                textColor = 'text-gray-800';
            } else if (testimonial.status === 'approved') {
                borderColor = 'bg-green-100';
                textColor = 'text-green-800';
                statusText = 'FEATURED';
            } 

            return (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${borderColor} ${textColor}`}>
                    {statusText}
                </span>
            );
        };

        return (
            <div className="bg-white p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{testimonial.userName || 'Anonymous User'}</p>
                            <p className="text-xs text-gray-500">{testimonial.role || 'No Role Specified'}</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <StatusBadge />
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(testimonial.submittedAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 pl-13">
                    <div className="flex mb-2">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                    </div>
                    <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
                </div>

                {actionError && (
                    <div className="p-3 border border-red-200 bg-red-50 text-sm text-red-700 rounded-md mb-4 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" /> {actionError}
                    </div>
                )}

                {!landingPage && (
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex gap-2 w-full sm:w-auto">
                            {isPending && (
                                <Button 
                                    onClick={() => handleAction(testimonial._id, 'approve')} 
                                    disabled={isActionDisabled || approvedCount >= MAX_APPROVED_TESTIMONIALS}
                                    className="bg-black text-white hover:bg-gray-800 text-xs px-3 py-2 h-auto w-full sm:w-auto justify-center"
                                >
                                    <Heart className="h-3 w-3 mr-2" /> 
                                    {actionLoading === 'approve' ? 'Featuring...' : 'Feature'}
                                </Button>
                            )}

                            {isApproved && (
                                <Button 
                                    onClick={() => handleAction(testimonial._id, 'revert')} 
                                    disabled={isActionDisabled} 
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs px-3 py-2 h-auto w-full sm:w-auto justify-center"
                                >
                                    <Clock className="h-3 w-3 mr-2" /> Unfeature
                                </Button>
                            )}
                        </div>
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
            <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
                {!landingPage && (
                    <div className="border-b border-gray-300 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-medium text-gray-900">Testimonials</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Filter:</span>
                                    <select 
                                        value={filterStatus} 
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-black focus:ring-black"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Featured</option>
                                    </select>
                                </div>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {approvedCount}/{MAX_APPROVED_TESTIMONIALS} Featured
                            </span>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-gray-200">
                    {filteredTestimonials.length > 0 ? (
                        filteredTestimonials.map(t => (
                            <TestimonialRow key={t._id} testimonial={t} />
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                                <User className="h-full w-full" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No testimonials found</h3>
                            <p className="text-gray-500 mt-1">
                                {landingPage ? 'No featured testimonials yet.' : `No ${filterStatus} testimonials match your criteria.`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
