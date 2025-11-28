import React, { useState, useEffect } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
// Assuming useStatsStore and other required utilities are available
import { useStatsStore } from '@/store/statsStore'; 
import Button from "@/components/ui/Button";

// Mock implementation of useStatsStore methods for this example
// NOTE: You must implement the addStat and updateStat actions in your real useStatsStore!

function StatSubmissionModal({ onClose, currentStat = null }) {
    // Determine if we are creating a new stat or editing an existing one
    const isEditing = !!currentStat;

    const [form, setForm] = useState({
        number: currentStat?.number || '',
        label: currentStat?.label || '',
        order: currentStat?.order || '',
    });
    a
    // We assume these actions exist in useStatsStore
    const { fetchPublicStats, statsLoading, statsError } = useStatsStore();
    
    // Mocking submission state since the store doesn't have it explicitly
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Mock/Placeholder submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        
        const { number, label, order } = form;

        if (!number || !label || !order || isNaN(parseInt(order))) {
            setSubmitError("Please fill all fields and ensure Order is a valid number.");
            return;
        }

        setIsSubmitting(true);
        
        // --- REAL SUBMISSION LOGIC ---
        try {
            // NOTE: You need to implement these API calls in your stats service and store!
            if (isEditing) {
                // await useStatsStore.getState().updateStat(currentStat._id, form);
                console.log("Mock: Updating Stat:", currentStat._id, form);
            } else {
                // await useStatsStore.getState().addStat(form);
                console.log("Mock: Adding Stat:", form);
            }
            
            // Re-fetch all stats to update the landing page immediately
            await fetchPublicStats(); 
            
            setSubmitSuccess(true);
            setTimeout(onClose, 1500); // Close after 1.5s
            
        } catch (error) {
            setSubmitError(error.message || "Failed to save stat. Check server status.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                    disabled={isSubmitting}
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold text-black mb-1">
                    {isEditing ? "Edit Statistic" : "Add New Statistic"}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Define the number, label, and display order for this metric.
                </p>

                {submitSuccess ? (
                    <div className="text-center py-10">
                        <Loader2 className="h-10 w-10 text-black mx-auto mb-3 animate-spin" />
                        <p className="font-semibold text-lg text-black">
                            {isEditing ? "Statistic Updated!" : "Statistic Added!"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Refreshing stats on landing page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Number Field */}
                        <div>
                            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                                Value (e.g., "85%", "3,000+")
                            </label>
                            <input
                                id="number"
                                name="number"
                                type="text"
                                value={form.number}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                placeholder="Enter the metric value"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Label Field */}
                        <div>
                            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                                Description (e.g., "Previlace User Pass Rate")
                            </label>
                            <input
                                id="label"
                                name="label"
                                type="text"
                                value={form.label}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                placeholder="Enter the metric description"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Order Field */}
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                                Display Order (1 = first, 2 = second)
                            </label>
                            <input
                                id="order"
                                name="order"
                                type="number"
                                value={form.order}
                                onChange={handleChange}
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                placeholder="Enter display order"
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        {(submitError || statsError) && (
                            <div className="flex items-center text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {submitError || statsError}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full flex items-center justify-center bg-black hover:bg-gray-800" 
                            disabled={isSubmitting || !form.number || !form.label || !form.order}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                                    Saving...
                                </>
                            ) : (
                                isEditing ? "Save Changes" : "Create Statistic"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default StatSubmissionModal;
