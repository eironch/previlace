import axios from "axios";

const testLogin = async () => {
    try {
        console.log("Attempting login...");
        const response = await axios.post("http://localhost:5000/api/auth/login", {
            identifier: "instructor1@previlace.com",
            password: "instructor1@previlace.com"
        });
        console.log("Login SUCCESS:", response.data);
    } catch (error) {
        console.error("Login FAILED:", error.response ? error.response.data : error.message);
    }
};

testLogin();
