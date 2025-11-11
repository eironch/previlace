import React, { useEffect, useState, useMemo } from 'react';
import { useTestimonialsStore } from "@/store/testimonialsStore";
import { Loader2, AlertTriangle, Filter, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';

// Import the row component for rendering individual entries
import TestimonialRow from './TestimonialRow';

const statusFilters = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'changes_requested', label: 'Changes Requested' },
];

export default function TestimonialsManager() {
    const { testimonials, isLoading, error, fetchTestimonials } = useTestimonialsStore();
    const [filterStatus, setFilterStatus] = useState('all');

    // 1. Fetch data on component mount
    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    // 2. Filter data based on selected status
    const filteredTestimonials = useMemo(() => {
        if (filterStatus === 'all') {
            return testimonials;
        }
        return testimonials.filter(t => t.status === filterStatus);
    }, [testimonials, filterStatus]);


    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
                <p className="ml-3 text-gray-600">Loading testimonials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700">Error loading data: {error}</p>
                <button 
                    onClick={fetchTestimonials} 
                    className="ml-auto text-sm text-red-500 hover:underline"
                >
                    <RefreshCw className="h-4 w-4 inline mr-1" /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Testimonials Management ({filteredTestimonials.length})</h2>

            {/* Filter and Stats Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-black focus:border-black"
                    >
                        {statusFilters.map(filter => (
                            <option key={filter.value} value={filter.value}>{filter.label} ({testimonials.filter(t => filter.value === 'all' || t.status === filter.value).length})</option>
                        ))}
                    </select>
                </div>
                
                <button 
                    onClick={fetchTestimonials}
                    className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Testimonial List */}
            <div className="space-y-4">
                {filteredTestimonials.length > 0 ? (
                    filteredTestimonials.map((testimonial) => (
                        <TestimonialRow key={testimonial._id} testimonial={testimonial} />
                    ))
                ) : (
                    <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-lg text-gray-500">No {filterStatus} testimonials found.</p>
                        {filterStatus !== 'pending' && (
                            <p className="text-sm text-gray-400 mt-2">Try switching the filter to 'Pending Review'.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}