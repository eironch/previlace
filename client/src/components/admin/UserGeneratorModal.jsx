import React, { useState } from "react";
import { UserPlus, Copy, Check, Eye, EyeOff, Mail, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import userManagementService from "../../services/userManagementService";
import { useAuthStore } from "@/store/authStore";
import Modal from "@/components/ui/Modal";

// Helper for years
const getCurrentYear = () => new Date().getFullYear();
const getFutureYears = (count = 3) => {
  const startYear = getCurrentYear();
  return Array.from({ length: count }, (_, i) => startYear + i);
};
const FUTURE_YEARS = getFutureYears();

const CORE_SUBJECTS = [
  "Numerical Ability",
  "Verbal Ability",
  "General Information",
  "Clerical Ability",
  "Logic & Reasoning",
  "Reading Comprehension",
  "Grammar & Language",
  "Philippine Constitution",
];

const STEPS = [
  { id: 1, title: "Account & Course" },
  { id: 2, title: "Personal Info" },
  { id: 3, title: "Education & Work" },
  { id: 4, title: "Additional Info" }
];

export default function UserGeneratorModal({ onClose, onSuccess, initialRole = "student" }) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Admin/System fields
    role: initialRole,
    sendCredentials: true,
    assignedSubjects: [],
    examType: "",
    targetExamMonth: "",
    targetExamYear: "",
    strongSubjects: [],

    // Registration fields
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

  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);

  // Handlers from RegistrationForm
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

  // Handlers from UserGeneratorModal
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function toggleSubject(subject) {
    setFormData(prev => {
      const current = prev.strongSubjects;
      const updated = current.includes(subject)
        ? current.filter(s => s !== subject)
        : [...current, subject];
      return { ...prev, strongSubjects: updated };
    });
  }

  function toggleAssignedSubject(subject) {
    setFormData(prev => {
      const current = prev.assignedSubjects;
      const updated = current.includes(subject)
        ? current.filter(s => s !== subject)
        : [...current, subject];
      return { ...prev, assignedSubjects: updated };
    });
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Calculate target date
    let targetExamDate = "";
    if (formData.targetExamMonth && formData.targetExamYear) {
      const datePart = formData.targetExamMonth === 'March' ? '03-01' : '08-01';
      targetExamDate = `${formData.targetExamYear}-${datePart}`;
    }

    // Calculate weak subjects
    const weakSubjects = CORE_SUBJECTS.filter(s => !formData.strongSubjects.includes(s));

    // Construct payload
    const payload = {
      firstName: formData.personalInfo.firstName,
      lastName: formData.personalInfo.lastName,
      email: formData.personalInfo.email,
      role: formData.role,
      examType: formData.examType,
      targetExamDate,
      weakSubjects,
      assignedSubjects: formData.assignedSubjects,
      sendCredentials: formData.sendCredentials,
      isProfileComplete: true,

      // Include full registration data
      courseInfo: formData.courseInfo,
      personalInfo: formData.personalInfo,
      education: formData.education,
      professional: formData.professional,
      marketing: formData.marketing,
    };

    try {
      const response = await userManagementService.createUser(payload);
      if (response.data?.user) {
        setCreatedUser(response.data.user);
        if (response.data.user.password) {
          setGeneratedPassword(response.data.user.password);
        }
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (createdUser) {
    return (
      <Modal
        isOpen={true}
        onClose={() => {
          onSuccess();
          onClose();
        }}
        title="User Created Successfully"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {createdUser.firstName} {createdUser.lastName}
            </h3>
            <p className="text-sm text-gray-500">{createdUser.email}</p>

            {formData.sendCredentials && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-blue-600">
                <Mail className="h-4 w-4" />
                <span>Credentials sent via email</span>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-gray-500">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm border border-gray-300 text-gray-900">
                {showPassword ? generatedPassword : "••••••••••••"}
              </code>
              <button
                onClick={() => copyToClipboard(generatedPassword)}
                className="rounded p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                title="Copy Password"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  // Simplified form for Instructor
  if (formData.role === 'instructor') {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Create Instructor Account"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.personalInfo.lastName}
                onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.personalInfo.email}
                onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.personalInfo.mobile}
                onChange={(e) => handleInputChange("personalInfo", "mobile", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="sendCredentials"
                checked={formData.sendCredentials}
                onChange={handleChange}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">Send credentials via email</span>
            </label>
          </div>

          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Assigned Subjects</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-lg bg-gray-50">
              {CORE_SUBJECTS.map(subject => (
                <label key={subject} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignedSubjects.includes(subject)}
                    onChange={() => toggleAssignedSubject(subject)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-xs text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Instructor
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Generate Student Account"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between px-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep >= step.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                {step.id}
              </div>
              <span className={`text-xs mt-1 font-medium ${currentStep >= step.id ? 'text-black' : 'text-gray-400'
                }`}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${currentStep > step.id ? 'bg-black' : 'bg-gray-200'
                  }`} style={{ width: 'calc(100% + 2rem)', transform: 'translateX(50%)' }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* STEP 1: Account & Course */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Account Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={true} // Lock role selection since it's passed in
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Options</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        name="sendCredentials"
                        checked={formData.sendCredentials}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">Send credentials via email</span>
                    </label>
                  </div>
                </div>
              </div>

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
                      placeholder="e.g. 8:00 AM - 5:00 PM"
                      value={formData.courseInfo.time}
                      onChange={(e) => handleInputChange("courseInfo", "time", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Exam Level</label>
                    <div className="flex gap-3">
                      {['Professional', 'Sub-Professional'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, examType: type }))}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.examType === type
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Month</label>
                    <select
                      name="targetExamMonth"
                      value={formData.targetExamMonth}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select Month</option>
                      <option value="March">March</option>
                      <option value="August">August</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Year</label>
                    <select
                      name="targetExamYear"
                      value={formData.targetExamYear}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select Year</option>
                      {FUTURE_YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 2: Personal Info */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
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
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                    <input
                      type="text"
                      value={formData.personalInfo.placeOfBirth}
                      onChange={(e) => handleInputChange("personalInfo", "placeOfBirth", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                    <select
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
                      value={formData.personalInfo.emergencyContact.name}
                      onChange={(e) => handleEmergencyChange("name", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={formData.personalInfo.emergencyContact.number}
                      onChange={(e) => handleEmergencyChange("number", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* STEP 3: Education & Work */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Educational Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">School (Last Attended)</label>
                    <input
                      type="text"
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
            </div>
          )}

          {/* STEP 4: Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">How Did You Know About CEVAS?</h3>
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

              {/* Strong Subjects (Optional for Student) */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Additional Info</h3>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Strong Subjects (Optional)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                    {CORE_SUBJECTS.map(subject => (
                      <label key={subject} className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.strongSubjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-xs text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
