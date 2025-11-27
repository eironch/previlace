import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import StandardHeader from "../../components/ui/StandardHeader";
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import RegistrationForm from "../../components/registrations/RegistrationForm";

export default function AdminRegistrationPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this application? This will create a user account.")) return;

        try {
            setActionLoading(true);
            const res = await apiClient.post(`/registrations/${id}/approve`);
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
            <StandardHeader
                title="Registration Applications"
                subtitle="Review and manage student registration forms"
            />

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
                {selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status Banner */}
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${selectedApp.status === 'pending' ? 'bg-yellow-50 text-yellow-800' :
                                    selectedApp.status === 'approved' ? 'bg-green-50 text-green-800' :
                                        'bg-red-50 text-red-800'
                                    }`}>
                                    {selectedApp.status === 'pending' ? <Clock className="w-5 h-5" /> :
                                        selectedApp.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                            <XCircle className="w-5 h-5" />}
                                    <span className="font-medium capitalize">Status: {selectedApp.status}</span>
                                    {selectedApp.registrationNumber && (
                                        <span className="ml-auto font-mono text-sm">Reg No: {selectedApp.registrationNumber}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Personal Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">Name:</span> {selectedApp.personalInfo.firstName} {selectedApp.personalInfo.middleName} {selectedApp.personalInfo.lastName}</p>
                                            <p><span className="text-gray-500">Email:</span> {selectedApp.personalInfo.email}</p>
                                            <p><span className="text-gray-500">Mobile:</span> {selectedApp.personalInfo.mobile}</p>
                                            <p><span className="text-gray-500">Address:</span> {selectedApp.personalInfo.address}</p>
                                            <p><span className="text-gray-500">Birth:</span> {format(new Date(selectedApp.personalInfo.dateOfBirth), "MMM d, yyyy")} ({selectedApp.personalInfo.placeOfBirth})</p>
                                            <p><span className="text-gray-500">Civil Status:</span> {selectedApp.personalInfo.civilStatus}</p>
                                            <p><span className="text-gray-500">Nationality:</span> {selectedApp.personalInfo.nationality}</p>
                                            <p><span className="text-gray-500">Emergency:</span> {selectedApp.personalInfo.emergencyContact.name} ({selectedApp.personalInfo.emergencyContact.number})</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Course Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">Course:</span> {selectedApp.courseInfo.courseEnrollingTo}</p>
                                            <p><span className="text-gray-500">Schedule:</span> {selectedApp.courseInfo.scheduledDays}</p>
                                            <p><span className="text-gray-500">Time:</span> {selectedApp.courseInfo.time}</p>
                                            <p><span className="text-gray-500">Start Date:</span> {format(new Date(selectedApp.courseInfo.date), "MMM d, yyyy")}</p>
                                        </div>

                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 mt-6">Education</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-500">School:</span> {selectedApp.education.school}</p>
                                            <p><span className="text-gray-500">Degree:</span> {selectedApp.education.degree}</p>
                                            <p><span className="text-gray-500">Highest Attainment:</span> {selectedApp.education.highestAttainment}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedApp.status === 'pending' && (
                                    <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                                        <button
                                            onClick={() => handleReject(selectedApp._id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                                        >
                                            Reject Application
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedApp._id)}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
                                        >
                                            Approve & Create Account
                                        </button>
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
