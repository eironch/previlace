import React from "react";
import InstructorAvailability from "../components/InstructorAvailability";
import InstructorTicketInbox from "../components/InstructorTicketInbox";
import { useAuthStore } from "../store/authStore";

const InstructorDashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.firstName}</p>
        </div>

        <div className="grid gap-8">
          <InstructorAvailability />
          
          <InstructorTicketInbox />
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
