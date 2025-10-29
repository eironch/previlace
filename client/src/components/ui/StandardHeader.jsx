import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, LogOut } from "lucide-react";
import Button from "@/components/ui/button1";

function StandardHeader({ title, showBack = false, backPath = "/dashboard" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
  }

  function handleBack() {
    navigate(backPath);
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-black hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-black">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default StandardHeader;
