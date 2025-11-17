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

    // --- Default statistics based on AdminStatsEditor labels ---
    const defaultStats = useMemo(() => ([
        { number: "85%", label: "Average CSE Pass Rate" },
        { number: "92%", label: "Previlace User Pass Rate" },
        { number: "12,000+", label: "Successful Students" },
        { number: "3,500+", label: "Government Jobs Matched" },
    ]), []);

    useEffect(() => {
        if (stats.length === 0) {
            fetchStats();
        }
    }, [fetchStats, stats.length]);

    const displayStats = stats.length > 0 ? stats : defaultStats;

    if (isLoading && stats.length === 0) {
        return (
            <div className="flex justify-center items-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading Statistics
            </div>
        );
    }

    if (error && stats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-100 text-red-700 rounded-lg">
                <div className="flex items-center mb-3">
                    <AlertCircle className="h-5 w-5 mr-2" /> Failed to load statistics.
                </div>
                <p className="text-sm text-gray-700">Displaying default values.</p>
            </div>
        );
    }

    return (
        <div className="py-12"> 
            <div className="grid grid-cols-2 gap-8 rounded-lg bg-gray-50 p-8 md:grid-cols-4">
                {displayStats.map((stat, index) => (
                    <div key={index} className="text-center">
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
