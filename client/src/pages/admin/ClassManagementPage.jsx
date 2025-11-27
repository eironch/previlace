import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import ClassScheduler from "@/components/admin/ClassScheduler";
import SubjectManager from "@/components/admin/SubjectManager";
import StandardHeader from "@/components/ui/StandardHeader";

export default function ClassManagementPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [refreshKey, setRefreshKey] = useState(0);
  const schedulerRef = useRef(null);
  const subjectManagerRef = useRef(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Class Schedule" 
        description="Manage weekend classes, subjects, and topics."
        onRefresh={handleRefresh}
        bottomContent={
          <div className="border-b border-gray-300">
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
        }
      >
        {activeTab === 'schedule' ? (
          <button
            onClick={() => schedulerRef.current?.openModal()}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        ) : (
          <button
            onClick={() => subjectManagerRef.current?.openSubjectModal()}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </StandardHeader>
      
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">

        {activeTab === 'schedule' ? (
          <ClassScheduler key={refreshKey} ref={schedulerRef} />
        ) : (
          <SubjectManager key={refreshKey} ref={subjectManagerRef} />
        )}
      </div>
    </div>
  );
}
