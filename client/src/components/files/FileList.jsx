import React, { useEffect, useState } from "react";
import { FileText, Download, Trash2, FileImage } from "lucide-react";
import { fileService } from "../../services/fileService";
import { useAuthStore } from "../../store/authStore";
import { format } from "date-fns";

export default function FileList({ relatedType, relatedId, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await fileService.getFiles(relatedType, relatedId);
      // Ensure data is always an array
      const filesData = Array.isArray(data) ? data : (data?.files || data?.data || []);
      setFiles(filesData);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [relatedType, relatedId, refreshTrigger]);

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fileService.deleteFile(id);
      fetchFiles();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <FileImage className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>;
  }

  if ((files || []).length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(files || []).map((file) => (
        <div
          key={file._id}
          className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            {getFileIcon(file.fileType)}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {file.originalName}
              </p>
              <p className="text-xs text-gray-500">
                {(file.fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                {format(new Date(file.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(file)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-black"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            {(user.role === "admin" || user._id === file.uploadedBy._id) && (
              <button
                onClick={() => handleDelete(file._id)}
                className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
