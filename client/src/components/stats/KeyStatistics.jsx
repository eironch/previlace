import React, { useEffect, useMemo } from 'react';
import { useStatsStore } from "../../store/statsStore"; 
import { Loader2, AlertCircle } from 'lucide-react';

export default function StatsDisplay() {
    const { 
        stats, 
        fetchStats, 
        isLoading, 
        error 
    } = useStatsStore();

    // 1. Renamed to fallbackStats and added unique 'key' for better list rendering (no styling changes)
    const fallbackStats = useMemo(() => ([
        { key: "cse", number: "85%", label: "Average CSE Pass Rate" }, 
        { key: "previlace", number: "92%", label: "Previlace User Pass Rate" },
        { key: "students", number: "12,000+", label: "Successful Students" },
        { key: "jobs", number: "3,500+", label: "Government Jobs Matched" },
    ]), []);

    // 2. Optimized useEffect hook to prevent unnecessary fetches and included 'isLoading' in dependencies
    useEffect(() => {
        // Fetch only if no stats are loaded AND we're not currently loading them
        if (stats.length === 0 && !isLoading) {
            fetchStats();
        }
    }, [fetchStats, stats.length, isLoading]);

    // 3. Renamed to currentStats for clearer intent
    const currentStats = stats.length > 0 ? stats : fallbackStats;

    // --- Conditional Rendering Blocks ---

    // Show spinner if loading AND we have no stats to display yet
    if (isLoading && stats.length === 0) {
        return (
            // Added role="status" and aria-hidden="true" for accessibility (A11y)
            <div className="flex justify-center items-center p-8 text-gray-500" role="status">
                <Loader2 className="h-6 w-6 animate-spin mr-2" aria-hidden="true" /> Loading Statistics
            </div>
        );
    }

    // Determine if an error occurred AND we had to fall back to default stats
    const hasErrorAndUsingFallback = error && stats.length === 0;

    return (
        // Added aria-live="polite" for accessibility
        <div className="py-12" aria-live="polite"> 
            
            {/* 4. Error message is displayed conditionally ABOVE the stats when a fallback is used */}
            {hasErrorAndUsingFallback && (
                // Original styling restored: bg-red-100, text-red-700, rounded-lg
                <div className="flex flex-col items-center justify-center p-8 bg-red-100 text-red-700 rounded-lg mb-8">
                    <div className="flex items-center mb-3">
                        <AlertCircle className="h-5 w-5 mr-2" aria-hidden="true" /> Failed to load statistics.
                    </div>
                    <p className="text-sm text-gray-700">Displaying default values.</p>
                </div>
            )}

            {/* Original display logic and styling restored */}
            <div className="grid grid-cols-2 gap-8 rounded-lg bg-gray-50 p-8 md:grid-cols-4">
                {currentStats.map((stat, index) => (
                    // 5. Use stat.key (from fallbackStats) or index for the list key
                    <div key={stat.key || index} className="text-center">
                        <div className="text-2xl font-bold text-black">
                            {stat.number}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}