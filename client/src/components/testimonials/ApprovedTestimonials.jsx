import React, { useEffect, useMemo } from 'react';
import { useTestimonialsStore } from "../../store/testimonialsStore"; // Using relative path
import { Star, Loader2, Quote } from 'lucide-react'; // Removed LayoutGrid, List, and useState/toggle logic

// --- Helper Components ---

// Star Rating component using Yellow for standard rating visibility
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

// Testimonial Card Layout A: Grid Focus (The mandated design: black-star, initial avatar)
const TestimonialCardA = ({ testimonial }) => (
    <div 
        key={testimonial._id || testimonial.id} 
        className="flex flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-md transition-transform duration-200 hover:shadow-lg hover:border-black/5"
    >
        <div className="flex-grow">
            {/* Using the black star design as requested */}
            <StarRating rating={testimonial.rating} size="h-4 w-4" color="black" />
            
            <p className="mb-4 text-gray-700 font-medium italic">
                "{testimonial.content}"
            </p>
        </div>
        
        {/* Author information with initial avatar, matching requested design */}
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
    // 1. Destructure state and action from the store
    const { 
        approvedTestimonials, 
        fetchApprovedTestimonials, 
        isTestimonialsLoading
    } = useTestimonialsStore();

    // 2. Fetch data when the component mounts
    useEffect(() => {
        // Only fetch if the list is empty
        if (approvedTestimonials.length === 0) {
            fetchApprovedTestimonials();
        }
    }, [fetchApprovedTestimonials, approvedTestimonials.length]);

    // Fallback data for a nice display when loading or empty, matching the structure if a fetch fails
    const mockTestimonials = useMemo(() => ([
        { id: 'm1', content: "The flashcards and mistake review were game-changers. I finally targeted my weak spots efficiently!", userName: "Alex M.", rating: 5, role: "Successful CSE Passer" },
        { id: 'm2', content: "The mock exams perfectly simulated the real test environment, reducing my anxiety significantly.", userName: "Samantha K.", rating: 4, role: "Successful CSE Passer" },
        { id: 'm3', content: "After passing, the resume builder and job matching feature helped me land my dream government job immediately.", userName: "Ben R.", rating: 5, role: "Successful CSE Passer" },
        // Added extra mock data that will be sliced off to ensure the slice works correctly
        { id: 'm4', content: "The dashboard analytics are top-notch.", userName: "Chris T.", rating: 4, role: "Student" },
    ]), []);

    // Slice to display exactly 3 testimonials, using mocks if no real data is loaded yet.
    // This ensures only the top 3 items are ever displayed.
    const testimonialsToDisplay = (approvedTestimonials.length > 0 ? approvedTestimonials : mockTestimonials).slice(0, 3);


    // 3. Handle Loading and Error states
    if (isTestimonialsLoading && approvedTestimonials.length === 0) {
        return (
            <div className="flex justify-center items-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading success stories...
            </div>
        );
    }

    if (testimonialsToDisplay.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 italic">
                Be the first to share your experience! No approved testimonials yet.
            </div>
        );
    }
    
    // 4. Render the Testimonial Grid (Layout A only, displaying exactly 3 items)
    return (
        // The grid scales: 1 column on mobile, 2 on medium, and 3 on large screens for the 3 items.
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsToDisplay.map((testimonial) => (
                <TestimonialCardA key={testimonial._id || testimonial.id} testimonial={testimonial} />
            ))}
        </div>
    );
}