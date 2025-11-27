import React from 'react';
import { Info } from 'lucide-react';

export default function ChartCard({ 
  title, 
  description, 
  insight, 
  icon: Icon,
  children,
  className = "" 
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="h-5 w-5 text-gray-900" />}
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>

      {insight && (
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
          <Info className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900">Insight: </span>
            {insight}
          </p>
        </div>
      )}
    </div>
  );
}
