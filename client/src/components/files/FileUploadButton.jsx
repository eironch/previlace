import React, { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { fileService } from "../../services/fileService";

export default function FileUploadButton({ relatedType, relatedId, onUploadComplete, className = "" }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await fileService.uploadFile(file, relatedType, relatedId);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.png,.webp"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${className}`}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}
