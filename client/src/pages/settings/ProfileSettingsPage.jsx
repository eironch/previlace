import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    GraduationCap,
    Lock,
    Bell,
    Shield,
    Save,
    Camera,
    Mail,
    Key,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import apiClient from "@/services/apiClient";
import StandardHeader from "@/components/ui/StandardHeader";
import SkeletonLoader from "@/components/ui/SkeletonLoader";

export default function ProfileSettingsPage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState("personal");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form States
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        middleName: "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        telNo: "",
        facebook: "",
        address: user?.address || "",
        dateOfBirth: user?.dateOfBirth || "",
        placeOfBirth: user?.placeOfBirth || "",
        civilStatus: user?.civilStatus || "",
        childrenCount: "",
        nationality: user?.nationality || "",
        emergencyContactName: user?.emergencyContact?.name || "",
        emergencyContactNumber: user?.emergencyContact?.number || "",

        // Course Info
        courseEnrollingTo: "",
        courseDate: "",
        scheduledDays: "",
        scheduledTime: "",

        // Education
        school: user?.school || "",
        dateAttended: "",
        degree: user?.degree || "",
        education: user?.education || "",
        languageSpoken: "",

        // Professional
        jobPosition: user?.jobPosition || "",
        company: user?.company || "",
        dateEmployment: "",
        examTaken: "",
        dateTaken: "",

        // Marketing
        source: "",

        examType: user?.examType || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [subjects, setSubjects] = useState([]);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            // Initial load from User object
            setProfileForm(prev => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                examType: user.examType || "",
            }));

            // Always attempt to fetch Registration Data
            apiClient.get("/users/my-registration")
                .then(res => {
                    const reg = res.data.data;
                    if (reg) {
                        setProfileForm(prev => ({
                            ...prev,
                            firstName: reg.personalInfo?.firstName || user.firstName || "",
                            middleName: reg.personalInfo?.middleName || "",
                            lastName: reg.personalInfo?.lastName || user.lastName || "",
                            email: reg.personalInfo?.email || user.email || "",
                            phone: reg.personalInfo?.mobile || user.phone || "",
                            telNo: reg.personalInfo?.telNo || "",
                            facebook: reg.personalInfo?.facebook || "",
                            address: reg.personalInfo?.address || user.address || "",
                            dateOfBirth: reg.personalInfo?.dateOfBirth || user.dateOfBirth || "",
                            placeOfBirth: reg.personalInfo?.placeOfBirth || user.placeOfBirth || "",
                            civilStatus: reg.personalInfo?.civilStatus || user.civilStatus || "",
                            childrenCount: reg.personalInfo?.childrenCount || "",
                            nationality: reg.personalInfo?.nationality || user.nationality || "",
                            emergencyContactName: reg.personalInfo?.emergencyContact?.name || user.emergencyContact?.name || "",
                            emergencyContactNumber: reg.personalInfo?.emergencyContact?.number || user.emergencyContact?.number || "",

                            // Course Info
                            courseEnrollingTo: reg.courseInfo?.courseEnrollingTo || "",
                            courseDate: reg.courseInfo?.date || "",
                            scheduledDays: reg.courseInfo?.scheduledDays || "",
                            scheduledTime: reg.courseInfo?.time || "",

                            // Education
                            school: reg.education?.school || user.school || "",
                            dateAttended: reg.education?.dateAttended || "",
                            degree: reg.education?.degree || user.degree || "",
                            education: reg.education?.highestAttainment || user.education || "",
                            languageSpoken: reg.education?.languageSpoken || "",

                            // Professional
                            jobPosition: reg.professional?.position || user.jobPosition || "",
                            company: reg.professional?.company || user.company || "",
                            dateEmployment: reg.professional?.dateEmployment || "",
                            examTaken: reg.professional?.examTaken || "",
                            dateTaken: reg.professional?.dateTaken || "",

                            // Marketing
                            source: reg.marketing?.source || "",
                        }));
                    }
                })
                .catch(err => {
                    console.log("No registration data found or failed to fetch:", err.message);
                });

            if (user.role === "instructor") {
                apiClient.get("/subjects/instructor/my-subjects")
                    .then(res => setSubjects(res.data.data))
                    .catch(err => console.error("Failed to fetch subjects:", err));
            }
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const updates = {};
            if (user.role === 'student') {
                updates.examType = profileForm.examType;
            }
            const response = await apiClient.patch("/users/profile", updates);

            if (response.data.success) {
                setUser(response.data.data.user);
                setMessage({ type: "success", text: "Profile updated successfully" });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await apiClient.patch("/users/update-password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setMessage({ type: "success", text: "Password updated successfully" });
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update password" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <SkeletonLoader />;

    const tabs = [
        { id: "personal", label: "Personal Info", icon: User },
        { id: "academic", label: "Academic & Work", icon: GraduationCap },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <StandardHeader
                title="Account Settings"
                description="Manage your personal information and security preferences"
            />

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 relative group cursor-pointer">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <nav className="p-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                            ? "bg-black text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-5xl">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                {message.text}
                            </div>
                        )}

                        {activeTab === "personal" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                            <p className="text-gray-500 text-sm mt-1">Update your personal details and contact info.</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                            {user.role} Account
                                        </span>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                                        {/* Personal Details */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                    <input type="text" value={profileForm.firstName} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                                                    <input type="text" value={profileForm.middleName} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                    <input type="text" value={profileForm.lastName} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                                    <input type="text" value={profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toLocaleDateString() : ""} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                                                    <input type="text" value={profileForm.placeOfBirth} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Civil Status</label>
                                                    <input type="text" value={profileForm.civilStatus} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                                                    <input type="text" value={profileForm.nationality} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">No. of Children</label>
                                                    <input type="text" value={profileForm.childrenCount} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                                    <input type="text" value={profileForm.address} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <input type="email" value={profileForm.email} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-gray-500 cursor-not-allowed" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                                    <input type="text" value={profileForm.phone} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tel. No.</label>
                                                    <input type="text" value={profileForm.telNo} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Link</label>
                                                    <input type="text" value={profileForm.facebook} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                                    <input type="text" value={profileForm.emergencyContactName} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                                    <input type="text" value={profileForm.emergencyContactNumber} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <>Saving Changes...</>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "academic" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Academic & Work</h2>
                                            <p className="text-gray-500 text-sm mt-1">View your educational background and work experience.</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                            {user.role} Account
                                        </span>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                                        {/* Course Information */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Enrolling To</label>
                                                    <input type="text" value={profileForm.courseEnrollingTo} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                    <input type="text" value={profileForm.courseDate ? new Date(profileForm.courseDate).toLocaleDateString() : ""} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Days</label>
                                                    <input type="text" value={profileForm.scheduledDays} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                                    <input type="text" value={profileForm.scheduledTime} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Education */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Education</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                                                    <input type="text" value={profileForm.school} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                                                    <input type="text" value={profileForm.degree} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Highest Attainment</label>
                                                    <input type="text" value={profileForm.education} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Attended</label>
                                                    <input type="text" value={profileForm.dateAttended} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language Spoken</label>
                                                    <input type="text" value={profileForm.languageSpoken} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Professional Experience */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Experience</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                                                    <input type="text" value={profileForm.jobPosition} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                                    <input type="text" value={profileForm.company} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Employment</label>
                                                    <input type="text" value={profileForm.dateEmployment} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Taken</label>
                                                    <input type="text" value={profileForm.examTaken} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Taken</label>
                                                    <input type="text" value={profileForm.dateTaken} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Other Information */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Other Information</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">How did you know about us?</label>
                                                <input type="text" value={profileForm.source} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed" />
                                            </div>
                                        </div>

                                        {user.role === 'student' && (
                                            <div className="pt-6 border-t border-gray-100">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">Exam Preferences</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {['Professional', 'Sub-Professional'].map((level) => (
                                                        <div
                                                            key={level}
                                                            onClick={() => setProfileForm(prev => ({ ...prev, examType: level }))}
                                                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${profileForm.examType === level
                                                                ? "border-black bg-gray-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-gray-900">{level} Level</span>
                                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${profileForm.examType === level ? "border-black" : "border-gray-300"
                                                                    }`}>
                                                                    {profileForm.examType === level && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-6 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <>Saving Changes...</>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                                        <p className="text-gray-500 text-sm mt-1">Update your password and secure your account.</p>
                                    </div>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={passwordForm.currentPassword}
                                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 pl-12 pr-12 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <div className="mt-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/auth/forgot-password")}
                                                    className="text-sm text-gray-600 hover:text-black hover:underline"
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={passwordForm.newPassword}
                                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-300 px-4 pr-12 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                                        placeholder="Min. 8 characters"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={passwordForm.confirmPassword}
                                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-300 px-4 pr-12 py-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                                        placeholder="Re-enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Password Requirements:</h4>
                                            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                                <li>Minimum 8 characters long</li>
                                                <li>At least one uppercase letter</li>
                                                <li>At least one number</li>
                                                <li>At least one special character</li>
                                            </ul>
                                        </div>

                                        <div className="pt-6 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                            >
                                                {isSaving ? "Updating..." : "Update Password"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                                        <p className="text-gray-500 text-sm mt-1">Choose what updates you want to receive.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { title: "Email Notifications", desc: "Receive daily summaries and important updates via email." },
                                            { title: "Study Reminders", desc: "Get reminded 15 minutes before your scheduled study sessions." },
                                            { title: "New Content Alerts", desc: "Be notified when new quizzes or materials are added." },
                                            { title: "Performance Reports", desc: "Receive weekly analysis of your progress and weak spots." }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
