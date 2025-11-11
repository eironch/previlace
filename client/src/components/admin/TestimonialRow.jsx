import React, { useState } from 'react';
import { useTestimonialsStore } from "@/store/testimonialsStore";
import { Send, CheckCircle, XCircle, Edit, Clock, User, MessageSquare, Star } from 'lucide-react';
import Button from '@/components/ui/Button'; // Assuming you have a reusable Button component

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    changes_requested: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function TestimonialRow({ testimonial }) {
    const { approveTestimonial, rejectTestimonial, requestChanges } = useTestimonialsStore();
    const [actionLoading, setActionLoading] = useState(null); // 'approve', 'reject', 'changes'
    const [actionError, setActionError] = useState(null);
    const [notes, setNotes] = useState('');
    const [showNotesInput, setShowNotesInput] = useState(false);

    const statusClass = statusColors[testimonial.status] || 'bg-gray-100 text-gray-800 border-gray-300';
    const isPending = testimonial.status === 'pending';

    const handleAction = async (actionType) => {
        setActionError(null);
        setActionLoading(actionType);
        try {
            switch (actionType) {
                case 'approve':
                    await approveTestimonial(testimonial._id, notes);
                    break;
                case 'reject':
                    await rejectTestimonial(testimonial._id, notes);
                    break;
                case 'changes_requested':
                    if (!notes.trim()) {
                        setActionError("Notes are required when requesting changes.");
                        setActionLoading(null);
                        return;
                    }
                    await requestChanges(testimonial._id, notes);
                    break;
            }
            setNotes('');
            setShowNotesInput(false);
        } catch (err) {
            setActionError(err.message || `Action failed for ${actionType}.`);
        } finally {
            setActionLoading(null);
        }
    };

    const StatusBadge = () => (
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusClass}`}>
            {testimonial.status.replace('_', ' ').toUpperCase()}
        </span>
    );
    
    // Helper to format date
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
                <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-black" />
                    <div>
                        <p className="font-semibold text-lg text-gray-900">{testimonial.userName || 'Anonymous User'}</p>
                        <p className="text-sm text-gray-600">{testimonial.role || 'No Role Specified'}</p>
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

            {/* Content and Rating */}
            <div className="mb-4">
                <div className="flex mb-2">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                
                {testimonial.adminNotes && (
                    <div className="mt-3 p-3 bg-gray-50 border-l-4 border-black text-sm text-gray-700 flex items-start">
                        <MessageSquare className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Admin Notes:</p>
                            <p>{testimonial.adminNotes}</p>
                        </div>
                    </div>
                )}
            </div>
            
            {actionError && (
                 <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-md mb-4 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" /> {actionError}
                 </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-3 border-t">
                {isPending ? (
                    <>
                        <Button 
                            onClick={() => handleAction('approve')} 
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> 
                            {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                        </Button>
                        
                        <Button 
                            onClick={() => setShowNotesInput(!showNotesInput)} 
                            disabled={actionLoading}
                            variant="outline"
                            className="text-red-600 border-red-400 hover:bg-red-50"
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>

                        <Button 
                            onClick={() => setShowNotesInput(!showNotesInput)} 
                            disabled={actionLoading}
                            variant="outline"
                            className="text-blue-600 border-blue-400 hover:bg-blue-50"
                        >
                            <Edit className="h-4 w-4 mr-2" /> Request Changes
                        </Button>
                    </>
                ) : (
                    <p className="text-sm text-gray-500">Status is final. To reverse, update the database directly or implement an undo function.</p>
                )}
            </div>

            {/* Notes Input for Rejection/Changes */}
            {showNotesInput && isPending && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg space-y-3">
                    <textarea
                        placeholder="Required: Enter notes explaining the rejection or necessary changes to the user..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="w-full p-2 border rounded-md text-sm focus:ring-black focus:border-black"
                    />
                    <div className="flex space-x-3">
                        <Button
                             onClick={() => handleAction('reject')} 
                             disabled={actionLoading || !notes.trim()}
                             className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                        >
                            {actionLoading === 'reject' ? 'Confirming...' : 'Confirm Reject'}
                        </Button>
                        <Button
                             onClick={() => handleAction('changes_requested')} 
                             disabled={actionLoading || !notes.trim()}
                             className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                        >
                            {actionLoading === 'changes_requested' ? 'Sending...' : 'Confirm Changes Request'}
                        </Button>
                        <Button
                            onClick={() => setShowNotesInput(false)}
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}