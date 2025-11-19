import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, TrendingUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// FIX: Using the determined stable relative path
import { useStatsStore } from "@/store/statsStore";

// Map labels from the store array structure back to simple form keys
const STAT_KEYS = {
    "Average CSE Pass Rate": "averagePassRate",
    "Previlace User Pass Rate": "previlaceUserPassRate",
    "Successful Students": "successfulStudents",
    "Government Jobs Matched": "governmentJobsMatched",
};

// Helper component to render the primary button
const Button = ({ children, onClick, disabled = false, isSaving = false, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled || isSaving}
        type="submit" // Ensure button works for form submission
        className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 shadow-md 
                    px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 ${className} ${disabled || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </button>
);


export default function AdminStatsEditor() {
    const { 
        stats, 
        fetchStats, 
        isLoading: isStatsLoading, 
        updateAdminStats 
    } = useStatsStore();
    
    // State for the inline form data
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: null, text: "" });

    // Helper to transform the store's array state into a form object {key: value}
    const storeStatsToObject = useCallback((statsArray) => {
        const obj = {};
        statsArray.forEach(stat => {
            const key = STAT_KEYS[stat.label];
            if (key) {
                obj[key] = stat.number; 
            }
        });
        return obj;
    }, []);

    // Effect to fetch initial data and populate form when stats change
    useEffect(() => {
        if (stats.length === 0) {
            fetchStats();
        } else {
            setFormData(storeStatsToObject(stats));
        }
    }, [stats, fetchStats, storeStatsToObject]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setStatusMessage({ type: null, text: "" }); // Clear messages on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage({ type: null, text: "" });

        const result = await updateAdminStats(formData);

        if (result.success) {
            setStatusMessage({ type: 'success', text: 'Statistics updated and refreshed successfully!' });
        } else {
            setStatusMessage({ type: 'error', text: result.error || "Update failed. Check console for details." });
        }

        setIsSaving(false);
    };
    
    // Reverse mapping for display labels in the form
    const formFields = useMemo(() => Object.entries(STAT_KEYS).map(([label, key]) => ({
        label, key, value: formData[key]
    })), [formData]);


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Landing Page Metrics</h2>

            {/* --- Summary / Refresh Controls --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-2 md:mb-0">Current Live Values</h3>
                <button 
                    onClick={fetchStats}
                    className="flex items-center text-sm text-black hover:text-gray-700 transition-colors"
                    disabled={isStatsLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isStatsLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* --- Stats Summary Panel --- */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {isStatsLoading && stats.length === 0 ? (
                    <div className="flex items-center text-gray-500 py-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading current stats...
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="border-l-4 border-black/10 pl-3">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-black">{stat.number}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* --- Inline Editing Form (Moved from Modal) --- */}
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">Update Metrics</h3>
                
                <div className="space-y-4">
                    {/* Input Fields Container */}
                    <div className="grid grid-cols-1 gap-4">
                        {formFields.map(({ label, key, value }) => (
                            <div key={key} className="space-y-1">
                                <label htmlFor={key} className="text-sm font-medium text-gray-700 block">
                                    {label}
                                </label>
                                <input
                                    id={key}
                                    name={key}
                                    type="text"
                                    value={value || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    placeholder="Enter value (e.g., 90% or 5,000+)"
                                    className="w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:ring-black focus:border-black transition"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Message Area */}
                {statusMessage.type && (
                    <div className={`p-3 rounded-lg flex items-center ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMessage.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                        <span className="text-sm font-medium">{statusMessage.text}</span>
                    </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <Button
                        isSaving={isSaving}
                        disabled={isStatsLoading}
                        className="text-base"
                    >
                        {isSaving ? "Saving Changes" : "Save Metrics to Live Site"}
                    </Button>
                </div>
            </form>
        </div>
    );
}