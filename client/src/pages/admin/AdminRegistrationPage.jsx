import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import StandardHeader from "../../components/ui/StandardHeader";
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import RegistrationForm from "../../components/registrations/RegistrationForm";

export default function AdminRegistrationPage({ showHeader = true, defaultOpenCreate = false }) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(defaultOpenCreate);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/registrations");
            setApplications(res.data.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const [approveData, setApproveData] = useState({
        examType: "Sub-Professional",
        sendEmail: true
    });

    // Reset approve data when a new app is selected
    useEffect(() => {
        if (selectedApp) {
            setApproveData({
                examType: "Sub-Professional",
                sendEmail: true
            });
        }
    }, [selectedApp]);

    const handleApproveConfirm = async () => {
        if (!selectedApp) return;

        if (!window.confirm("Are you sure you want to approve this application? This will create a user account.")) return;

        try {
            setActionLoading(true);
            const res = await apiClient.post(`/registrations/${selectedApp._id}/approve`, approveData);
            alert(`Application approved! User created with password: ${res.data.data.generatedPassword}`);
            fetchApplications();
            setSelectedApp(null);
        } catch (error) {
            alert(error.message || "Failed to approve application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this application?")) return;

        try {
            setActionLoading(true);
            await apiClient.post(`/registrations/${id}/reject`);
            fetchApplications();
            setSelectedApp(null);
        } catch (error) {
            alert(error.message || "Failed to reject application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        fetchApplications();
        alert("Registration created successfully!");
    };

    const filteredApps = applications.filter(app => {
        const matchesStatus = filterStatus === "all" || app.status === filterStatus;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            app.personalInfo.firstName.toLowerCase().includes(searchLower) ||
            app.personalInfo.lastName.toLowerCase().includes(searchLower) ||
            app.personalInfo.email.toLowerCase().includes(searchLower) ||
            (app.registrationNumber && app.registrationNumber.toLowerCase().includes(searchLower));

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {showHeader && (
                <StandardHeader
                    title="Registration Applications"
                    subtitle="Review and manage student registration forms"
                />
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Filters & Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                            {["pending", "approved", "rejected", "all"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${filterStatus === status ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or reg no..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                New Registration
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Reg. No.</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Applicant</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Course</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Date Submitted</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading applications...</td>
                                        </tr>
                                    ) : filteredApps.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                                        </tr>
                                    ) : (
                                        filteredApps.map((app) => (
                                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {app.registrationNumber || "N/A"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{app.personalInfo.firstName} {app.personalInfo.lastName}</p>
                                                        <p className="text-gray-500 text-xs">{app.personalInfo.email}</p>
                                                        <p className="text-gray-500 text-xs">{app.personalInfo.mobile}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-gray-900">{app.courseInfo.courseEnrollingTo}</p>
                                                    <p className="text-gray-500 text-xs">{app.courseInfo.scheduledDays}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {format(new Date(app.createdAt), "MMM d, yyyy")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedApp(app)}
                                                        className="text-gray-600 hover:text-black font-medium text-xs border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-100"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-xl font-bold text-gray-900">New Registration</h2>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <RegistrationForm
                                    onSuccess={handleCreateSuccess}
                                    onCancel={() => setIsCreateModalOpen(false)}
                                    isAdminMode={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {/* Detail Modal */}
                {selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${selectedApp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                        selectedApp.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {selectedApp.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 sm:p-8 space-y-8">
                                {/* Header Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Submitted: {format(new Date(selectedApp.createdAt), "PPP")}</span>
                                        </div>
                                        {selectedApp.registrationNumber && (
                                            <div className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                {selectedApp.registrationNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Left Column: Personal Info (Span 7) */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                Personal Information
                                            </h3>
                                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                                        <p className="font-medium text-gray-900 text-base">
                                                            {selectedApp.personalInfo.firstName} {selectedApp.personalInfo.middleName} {selectedApp.personalInfo.lastName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Email Address</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.mobile}</p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs text-gray-500 mb-1">Address</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.address}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                                                        <p className="font-medium text-gray-900">
                                                            {format(new Date(selectedApp.personalInfo.dateOfBirth), "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Place of Birth</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.placeOfBirth}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Civil Status</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.civilStatus}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Nationality</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.nationality}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Emergency Contact</h3>
                                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.emergencyContact.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.personalInfo.emergencyContact.number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Academic & Work (Span 5) */}
                                    <div className="lg:col-span-5 space-y-8">
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Course Details</h3>
                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Selected Course</p>
                                                        <p className="font-bold text-gray-900">{selectedApp.courseInfo.courseEnrollingTo}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Schedule</p>
                                                            <p className="font-medium text-gray-900">{selectedApp.courseInfo.scheduledDays}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Time</p>
                                                            <p className="font-medium text-gray-900">{selectedApp.courseInfo.time}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {format(new Date(selectedApp.courseInfo.date), "MMMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Education</h3>
                                            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">School / University</p>
                                                    <p className="font-medium text-gray-900">{selectedApp.education.school}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Degree / Course</p>
                                                    <p className="font-medium text-gray-900">{selectedApp.education.degree}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Highest Attainment</p>
                                                    <p className="font-medium text-gray-900">{selectedApp.education.highestAttainment}</p>
                                                </div>
                                            </div>
                                        </section>

                                        {selectedApp.professional && (
                                            <section>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Professional History</h3>
                                                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4 text-sm">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Exam Taken</p>
                                                            <p className="font-medium text-gray-900">{selectedApp.professional.examTaken || "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Date Taken</p>
                                                            <p className="font-medium text-gray-900">{selectedApp.professional.dateTaken || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Company</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.professional.company || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Position</p>
                                                        <p className="font-medium text-gray-900">{selectedApp.professional.position || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </div>

                                {selectedApp.status === 'pending' && (
                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Approval Settings</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                                        Assign Exam Type
                                                    </label>
                                                    <select
                                                        value={approveData.examType}
                                                        onChange={(e) => setApproveData({ ...approveData, examType: e.target.value })}
                                                        className="w-full rounded-lg border-gray-300 text-sm focus:border-black focus:ring-black"
                                                    >
                                                        <option value="Sub-Professional">Sub-Professional</option>
                                                        <option value="Professional">Professional</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-end pb-2">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id="sendEmail"
                                                                checked={approveData.sendEmail}
                                                                onChange={(e) => setApproveData({ ...approveData, sendEmail: e.target.checked })}
                                                                className="peer h-5 w-5 rounded border-gray-300 text-black focus:ring-black transition-all"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-700 group-hover:text-black transition-colors select-none">
                                                            Send login credentials via email
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleReject(selectedApp._id)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                                            >
                                                Reject Application
                                            </button>
                                            <button
                                                onClick={handleApproveConfirm}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                                            >
                                                Approve & Create Account
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

