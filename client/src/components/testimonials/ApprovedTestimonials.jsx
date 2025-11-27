import React, { useEffect } from 'react';
import { useTestimonialsStore } from "../../store/testimonialsStore";
import { Star, Loader2 } from 'lucide-react';

// --- Helper Components ---

const StarRating = ({ rating, size = 'h-4 w-4', color = 'yellow' }) => {
    const fullStars = Math.round(rating || 5);
    const fillClass = color === 'yellow' 
        ? 'fill-yellow-500 text-yellow-500' 
        : 'fill-black text-black';
    const emptyClass = color === 'yellow' 
        ? 'fill-gray-300 text-gray-300' 
        : 'fill-gray-200 text-gray-200';

    return (
        <div className="flex mb-3">
            {Array.from({ length: 5 }, (_, index) => (
                <Star 
                    key={index}
                    className={`${size} ${index < fullStars ? fillClass : emptyClass}`}
                />
            ))}
        </div>
    );
};

const TestimonialCardA = ({ testimonial }) => (
    <div 
        key={testimonial._id || testimonial.id} 
        className="flex flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-md transition-transform duration-200 hover:shadow-lg hover:border-black/5"
    >
        <div className="flex-grow">
            <StarRating rating={testimonial.rating} size="h-4 w-4" color="black" />
            <p className="mb-4 text-gray-700 font-medium italic">
                "{testimonial.content}"
            </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <span className="text-sm font-semibold text-black">
                    {(testimonial.userName || 'U').charAt(0)}
                </span>
            </div>
            <div>
                <p className="text-sm font-semibold text-black">
                    {testimonial.userName && testimonial.userName.trim() !== '' ? testimonial.userName : "Anonymous User"}
                </p>
                <p className="text-xs text-gray-500">{testimonial.role || 'Verified Learner'}</p>
            </div>
        </div>
    </div>
);

// --- Main Component ---
export default function ApprovedTestimonials() {
    const { 
        approvedTestimonials, 
        fetchApprovedTestimonials, 
        isTestimonialsLoading
    } = useTestimonialsStore();

    useEffect(() => {
        if (approvedTestimonials.length === 0) {
            fetchApprovedTestimonials();
        }
    }, [fetchApprovedTestimonials, approvedTestimonials.length]);

    if (isTestimonialsLoading && approvedTestimonials.length === 0) {
        return (
            <div className="flex justify-center items-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading success stories...
            </div>
        );
    }

    if (approvedTestimonials.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 italic">
                Be the first to share your experience! No approved testimonials yet.
            </div>
        );
    }

    // Display exactly 3 testimonials
    const testimonialsToDisplay = approvedTestimonials.slice(0, 3);

    return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsToDisplay.map((testimonial) => (
                <TestimonialCardA key={testimonial._id || testimonial.id} testimonial={testimonial} />
            ))}
        </div>
    );
}
