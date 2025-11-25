import React, { useState } from 'react';
import StandardHeader from "@/components/ui/StandardHeader";
import ClassScheduler from "@/components/admin/ClassScheduler";
import SubjectManager from "@/components/admin/SubjectManager";

export default function ClassManagementPage() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Class Management</h1>
          <p className="mt-2 text-gray-600">Manage weekend classes, subjects, and topics.</p>
        </div>

        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === 'subjects'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Subjects & Topics
            </button>
          </nav>
        </div>

        {activeTab === 'schedule' ? <ClassScheduler /> : <SubjectManager />}
      </div>
    </div>
  );
}
