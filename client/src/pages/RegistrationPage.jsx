import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import RegistrationForm from "../components/registrations/RegistrationForm";

export default function RegistrationPage() {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);

    const handleSuccess = () => {
        setSuccess(true);
        window.scrollTo(0, 0);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for registering. Your application has been sent to our team for review. You will receive an email once your account has been created.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-black px-6 py-4">
                        <h1 className="text-xl font-bold text-white">Student Information & Registration Form</h1>
                        <p className="text-gray-300 text-sm">Please fill out all required fields accurately.</p>
                    </div>

                    <div className="p-6 sm:p-8">
                        <RegistrationForm onSuccess={handleSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
}
