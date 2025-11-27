import React, { useState } from "react";
import FileUploadButton from "../../components/files/FileUploadButton";
import FileList from "../../components/files/FileList";
import StandardHeader from "@/components/ui/StandardHeader";

export default function FileManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <StandardHeader 
        title="Resources" 
        description="Manage global resources and files"
        onRefresh={handleRefresh}
      >
        <FileUploadButton
          relatedType="resource"
          relatedId="global_resources"
          onUploadComplete={handleRefresh}
        />
      </StandardHeader>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Global Resources</h3>
                <FileList
                    relatedType="resource"
                    relatedId="global_resources"
                    refreshTrigger={refreshTrigger}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
