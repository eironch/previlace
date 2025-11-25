import React from 'react';
import InstructorAvailability from '../../components/InstructorAvailability';

export default function InstructorAvailabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Availability Settings</h1>
          <p className="mt-2 text-gray-600">Set your availability for the next 10-12 weeks.</p>
        </div>
        
        <InstructorAvailability />
      </div>
    </div>
  );
}
