import React, { useState } from "react";
import apiClient from "../../services/apiClient";
import { AlertCircle } from "lucide-react";

export default function RegistrationForm({ onSuccess, onCancel, isAdminMode = false }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        courseInfo: {
            date: new Date().toISOString().split("T")[0],
            courseEnrollingTo: "",
            scheduledDays: "",
            time: "",
        },
        personalInfo: {
            firstName: "",
            lastName: "",
            middleName: "",
            address: "",
            telNo: "",
            mobile: "",
            email: "",
            facebook: "",
            dateOfBirth: "",
            placeOfBirth: "",
            civilStatus: "",
            childrenCount: 0,
            nationality: "",
            emergencyContact: {
                name: "",
                number: "",
            },
        },
        education: {
            school: "",
            dateAttended: "",
            highestAttainment: "",
            languageSpoken: "",
            degree: "",
        },
        professional: {
            examTaken: "",
            dateTaken: "",
            company: "",
            dateEmployment: "",
            position: "",
        },
        marketing: {
            source: [],
        },
    });

    const handleInputChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleEmergencyChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                emergencyContact: {
                    ...prev.personalInfo.emergencyContact,
                    [field]: value,
                },
            },
        }));
    };

    const handleMarketingChange = (source) => {
        setFormData((prev) => {
            const currentSources = prev.marketing.source;
            const newSources = currentSources.includes(source)
                ? currentSources.filter((s) => s !== source)
                : [...currentSources, source];
            return {
                ...prev,
                marketing: {
                    ...prev.marketing,
                    source: newSources,
                },
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await apiClient.post("/registrations", formData);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || "Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Course & Class Information */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Course & Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.courseInfo.date}
                            onChange={(e) => handleInputChange("courseInfo", "date", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Enrolling To</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Intensive, Twin Package"
                            value={formData.courseInfo.courseEnrollingTo}
                            onChange={(e) => handleInputChange("courseInfo", "courseEnrollingTo", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Days</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Mon-Fri, Sat-Sun"
                            value={formData.courseInfo.scheduledDays}
                            onChange={(e) => handleInputChange("courseInfo", "scheduledDays", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 8:00 AM - 5:00 PM"
                            value={formData.courseInfo.time}
                            onChange={(e) => handleInputChange("courseInfo", "time", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            </section>

            {/* Personal Information */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.firstName}
                            onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                        <input
                            type="text"
                            value={formData.personalInfo.middleName}
                            onChange={(e) => handleInputChange("personalInfo", "middleName", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.lastName}
                            onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.address}
                            onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tel No.</label>
                        <input
                            type="text"
                            value={formData.personalInfo.telNo}
                            onChange={(e) => handleInputChange("personalInfo", "telNo", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.mobile}
                            onChange={(e) => handleInputChange("personalInfo", "mobile", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.personalInfo.email}
                            onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Account</label>
                        <input
                            type="text"
                            value={formData.personalInfo.facebook}
                            onChange={(e) => handleInputChange("personalInfo", "facebook", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            required
                            value={formData.personalInfo.dateOfBirth}
                            onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.placeOfBirth}
                            onChange={(e) => handleInputChange("personalInfo", "placeOfBirth", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                        <select
                            required
                            value={formData.personalInfo.civilStatus}
                            onChange={(e) => handleInputChange("personalInfo", "civilStatus", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        >
                            <option value="">Select</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Separated">Separated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. of Children</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.personalInfo.childrenCount}
                            onChange={(e) => handleInputChange("personalInfo", "childrenCount", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.nationality}
                            onChange={(e) => handleInputChange("personalInfo", "nationality", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Person to Contact in Case of Emergency</h4>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.emergencyContact.name}
                            onChange={(e) => handleEmergencyChange("name", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            required
                            value={formData.personalInfo.emergencyContact.number}
                            onChange={(e) => handleEmergencyChange("number", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            </section>

            {/* Educational Background */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Educational Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">School (Last Attended)</label>
                        <input
                            type="text"
                            required
                            value={formData.education.school}
                            onChange={(e) => handleInputChange("education", "school", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Attended</label>
                        <input
                            type="text"
                            value={formData.education.dateAttended}
                            onChange={(e) => handleInputChange("education", "dateAttended", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Highest Educational Attainment</label>
                        <input
                            type="text"
                            value={formData.education.highestAttainment}
                            onChange={(e) => handleInputChange("education", "highestAttainment", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language Spoken</label>
                        <input
                            type="text"
                            value={formData.education.languageSpoken}
                            onChange={(e) => handleInputChange("education", "languageSpoken", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                            type="text"
                            value={formData.education.degree}
                            onChange={(e) => handleInputChange("education", "degree", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            </section>

            {/* Professional Qualification */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Professional Qualification & Work History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Exam Taken (PRC, NCLEX, etc.)</label>
                        <input
                            type="text"
                            value={formData.professional.examTaken}
                            onChange={(e) => handleInputChange("professional", "examTaken", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
                        <input
                            type="text"
                            value={formData.professional.dateTaken}
                            onChange={(e) => handleInputChange("professional", "dateTaken", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            value={formData.professional.company}
                            onChange={(e) => handleInputChange("professional", "company", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Employment</label>
                        <input
                            type="text"
                            value={formData.professional.dateEmployment}
                            onChange={(e) => handleInputChange("professional", "dateEmployment", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                            type="text"
                            value={formData.professional.position}
                            onChange={(e) => handleInputChange("professional", "position", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                        />
                    </div>
                </div>
            </section>

            {/* Marketing */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">How Did You Know About Us?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["Tarpaulin", "Sulit.com.ph", "Laguna Libre", "Website", "Facebook Account", "Someone You Know"].map((source) => (
                        <label key={source} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.marketing.source.includes(source)}
                                onChange={() => handleMarketingChange(source)}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <span className="text-sm text-gray-700">{source}</span>
                        </label>
                    ))}
                </div>
            </section>

            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Submitting..." : isAdminMode ? "Create Registration" : "Submit Registration"}
                </button>
            </div>
        </form>
    );
}
