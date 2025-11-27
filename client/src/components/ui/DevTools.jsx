import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import apiClient from "@/services/apiClient";

export default function DevTools() {
  const { user, set, logout } = useAuthStore();
  const { setShowAuthModal } = useAppStore();
  const [isPopulating, setIsPopulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);

  async function handlePopulateTestData() {
    if (!confirm("Populate database with test questions and achievements?")) {
      return;
    }

    setIsPopulating(true);
    try {
      const response = await apiClient.post("/seed/populate");
      alert(`Success: ${response.data.data.questionsCreated} questions and ${response.data.data.achievementsCreated} achievements created`);
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  }

  async function handleClearTestData() {
    if (!confirm("This will delete ALL questions and achievements. Continue?")) {
      return;
    }

    setIsClearing(true);
    try {
      await apiClient.delete("/seed/clear");
      alert("Test data cleared successfully");
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  }

  async function handleResetAndReseed() {
    if (!confirm("This will DELETE ALL DATA and reseed with fresh CSE content. This may take 1-2 minutes. Continue?")) {
      return;
    }

    setIsReseeding(true);
    try {
      const response = await apiClient.post("/seed/reset-and-reseed");
      alert("Database reset and reseeded successfully! Page will reload.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsReseeding(false);
    }
  }

  function resetProfile() {
    localStorage.removeItem("user_data");
    set({ user: null, isAuthenticated: false });
    alert("Profile data reset");
  }

  function clearLocalStorage() {
    localStorage.clear();
    alert("localStorage cleared");
  }

  async function triggerLogout() {
    await logout();
    alert("Logged out");
  }

  function openAuth() {
    setShowAuthModal(true);
  }

  function logUserToConsole() {
    if (process.env.NODE_ENV === "development") {
      console.log({ user });
    }
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
      <div className="bg-black text-white rounded-full p-3 shadow-lg w-12 h-12 flex items-center justify-center cursor-pointer">
        <button
          aria-label="dev-tools"
          onClick={() => {
            const el = document.getElementById("devtools-panel");
            if (el) el.style.display = el.style.display === "none" ? "block" : "none";
          }}
          className="w-full h-full"
        >
          ⚙️
        </button>
      </div>

      <div id="devtools-panel" style={{ display: "none", marginTop: 8 }}>
        <div className="bg-white rounded-lg shadow-lg p-4 w-72 text-sm">
          <div className="mb-2 font-semibold">Dev Tools</div>
          <div className="space-y-2">
            <button 
              onClick={handleResetAndReseed} 
              disabled={isReseeding}
              className="w-full rounded border px-2 py-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50 font-semibold"
            >
              {isReseeding ? "Reseeding..." : "Reset & Reseed Database"}
            </button>

            <div className="border-t my-2"></div>

            <button 
              onClick={handlePopulateTestData} 
              disabled={isPopulating}
              className="w-full rounded border px-2 py-1 bg-green-200 hover:bg-green-200 disabled:opacity-50"
            >
              {isPopulating ? "Populating..." : "Populate Test Data"}
            </button>
            
            <button 
              onClick={handleClearTestData} 
              disabled={isClearing}
              className="w-full rounded border px-2 py-1 bg-red-200 hover:bg-red-200 disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear Test Data"}
            </button>

            <div className="border-t my-2"></div>

            <button onClick={resetProfile} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Reset profile data
            </button>
            
            <button onClick={clearLocalStorage} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Clear localStorage
            </button>
            
            <button onClick={triggerLogout} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Logout
            </button>
            
            <button onClick={openAuth} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Open auth modal
            </button>
            
            <button onClick={() => location.reload()} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Reload page
            </button>
            
            <button onClick={logUserToConsole} className="w-full rounded border px-2 py-1 hover:bg-gray-200">
              Log user to console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
