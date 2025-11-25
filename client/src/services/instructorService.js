import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const instructorService = {
  getAllInstructors: async () => {
    // Assuming there's an endpoint to get all instructors. 
    // If not, we might need to use userManagementService or add a specific endpoint.
    // For now, let's assume /api/admin/users?role=instructor or similar.
    // But wait, I didn't create a specific "get all instructors" endpoint in instructorController.
    // I created getAvailableInstructors in instructorAvailabilityController.
    // Let's use that or the user management one.
    // Actually, I should probably add a simple getInstructors to userController or just use the user management one.
    // Let's assume we can filter users by role.
    const response = await axios.get(`${API_URL}/api/admin/users`, {
      params: { role: "instructor" },
      withCredentials: true,
    });
    return response.data.data.users;
  },

  getAvailability: async (instructorId) => {
    const response = await axios.get(`${API_URL}/api/instructor-availability/${instructorId || ""}`, {
      withCredentials: true,
    });
    return response.data.availability;
  },

  setAvailability: async (availabilityData) => {
    const response = await axios.post(`${API_URL}/api/instructor-availability`, availabilityData, {
      withCredentials: true,
    });
    return response.data.availability;
  },
};

export default instructorService;
