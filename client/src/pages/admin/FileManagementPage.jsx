import React, { useState } from "react";
import FileUploadButton from "../../components/files/FileUploadButton";
import FileList from "../../components/files/FileList";

export default function FileManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
            <p className="mt-2 text-gray-600">
              Manage all system files and resources.
            </p>
          </div>
          <FileUploadButton onUploadComplete={handleUploadComplete} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">All Files</h2>
          <FileList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
