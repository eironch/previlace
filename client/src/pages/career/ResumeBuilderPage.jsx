import React, { useEffect, useState } from "react";
import { Save, FileText, Plus, Trash2, Download } from "lucide-react";
import { resumeService } from "../../services/resumeService";

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const data = await resumeService.getMyResume();
      setResume(data);
    } catch (error) {
      console.error("Failed to fetch resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await resumeService.updateResume(resume);
      alert("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save resume:", error);
      alert("Failed to save resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (section === "personalInfo") {
      setResume((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value },
      }));
    } else if (index !== null) {
      setResume((prev) => {
        const newSection = [...prev[section]];
        newSection[index] = { ...newSection[index], [field]: value };
        return { ...prev, [section]: newSection };
      });
    }
  };

  const addItem = (section, initialData) => {
    setResume((prev) => ({
      ...prev,
      [section]: [...prev[section], initialData],
    }));
  };

  const removeItem = (section, index) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Resume Builder
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => alert("PDF Generation coming soon!")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Personal Info */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Personal Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={resume.personalInfo.firstName || ""}
                onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={resume.personalInfo.lastName || ""}
                onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={resume.personalInfo.email || ""}
                onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={resume.personalInfo.phone || ""}
                onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
              <textarea
                rows={3}
                value={resume.personalInfo.summary || ""}
                onChange={(e) => handleInputChange("personalInfo", "summary", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Experience</h2>
            <button
              onClick={() => addItem("experience", { title: "", company: "", startDate: "", description: "" })}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" /> Add Experience
            </button>
          </div>
          <div className="space-y-6">
            {resume.experience.map((exp, index) => (
              <div key={index} className="relative rounded-lg border border-gray-100 bg-gray-50 p-4">
                <button
                  onClick={() => removeItem("experience", index)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleInputChange("experience", "title", e.target.value, index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleInputChange("experience", "company", e.target.value, index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">Description</label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleInputChange("experience", "description", e.target.value, index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Education</h2>
            <button
              onClick={() => addItem("education", { school: "", degree: "", startDate: "", description: "" })}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" /> Add Education
            </button>
          </div>
          <div className="space-y-6">
            {resume.education.map((edu, index) => (
              <div key={index} className="relative rounded-lg border border-gray-100 bg-gray-50 p-4">
                <button
                  onClick={() => removeItem("education", index)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500">School</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleInputChange("education", "school", e.target.value, index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleInputChange("education", "degree", e.target.value, index)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
