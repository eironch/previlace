import React, { useState } from 'react';
import Button from "@/components/ui/Button";
import { X, Send, AlertCircle, Check, Star } from 'lucide-react';
import { useTestimonialsStore } from "@/store/testimonialsStore"; 
import { useAuthStore } from "@/store/authStore"; 

function TestimonialSubmissionModal({ onClose, onSuccessfulSubmit }) {
    const [content, setContent] = useState('');
    const [role, setRole] = useState(''); 
    const [rating, setRating] = useState(5); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { submitTestimonial } = useTestimonialsStore();
    const { isAuthenticated } = useAuthStore();
    
    // Safety check - though the button should prevent this
    if (!isAuthenticated) {
        onClose();
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (content.trim().length < 50) {
            setError("Please write at least 50 characters for the content.");
            return;
        }
        if (!role.trim()) {
            setError("Please provide your role/title (e.g., 'CSE Passer').");
            return;
        }

        setIsLoading(true);
        try {
            // Passes content, role, and rating to the backend
            await submitTestimonial({ 
                content: content.trim(),
                role: role.trim(),
                rating: rating
            }); 
            
            setSuccess(true);
            if (onSuccessfulSubmit) {
                onSuccessfulSubmit();
            }

            setTimeout(onClose, 2000); 

        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit testimonial. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 relative">
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                    disabled={isLoading}
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-black mb-4">Share Your Success Story</h2>
                <p className="text-sm text-gray-600 mb-6">
                    We'll use your name and email from your profile. Please provide a title and your rating.
                </p>

                {success ? (
                    <div className="text-center py-10">
                        <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
                        <p className="font-semibold text-lg text-green-600">Testimonial Submitted!</p>
                        <p className="text-sm text-gray-500 mt-1">Thank you for sharing. It's now pending review.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        
                        {/* 1. RATING FIELD */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Rating
                            </label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((starValue) => (
                                    <Star 
                                        key={starValue}
                                        className={`h-6 w-6 cursor-pointer transition-colors ${
                                            rating >= starValue ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
                                        }`}
                                        onClick={() => setRating(starValue)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 2. ROLE/TITLE FIELD */}
                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Descriptive Title (e.g., "Civil Service Passer - Professional Level")
                            </label>
                            <input
                                id="role"
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black text-sm"
                                placeholder="Your role/title"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* 3. CONTENT FIELD */}
                        <div className="mb-4">
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Testimonial Content
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black text-sm"
                                placeholder="Start writing your experience..."
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full flex items-center justify-center" 
                            disabled={isLoading || content.trim().length < 50 || !role.trim()}
                        >
                            {isLoading ? (
                                "Submitting..."
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Review
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default TestimonialSubmissionModal;