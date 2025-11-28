import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, TrendingUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Preview Card */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Live Preview</h3>
                    </div>

                    {isStatsLoading && stats.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading stats...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-black">{stat.number}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Update Values</h3>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                        {formFields.map(({ label, key, value }) => (
                            <div key={key}>
                                <label htmlFor={key} className="text-sm font-medium text-gray-700 block mb-1">
                                    {label}
                                </label>
                                <input
                                    id={key}
                                    name={key}
                                    type="text"
                                    value={value || ''}
                                    onChange={handleChange}
                                    disabled={isSaving}
                                    placeholder="e.g., 90%"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black transition-colors"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        {statusMessage.type && (
                            <div className={`mb-4 p-3 rounded-lg flex items-center text-sm ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {statusMessage.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                                {statusMessage.text}
                            </div>
                        )}

                        <Button
                            isSaving={isSaving}
                            disabled={isStatsLoading}
                            className="w-full"
                        >
                            {isSaving ? "Saving Changes..." : "Save Updates"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
