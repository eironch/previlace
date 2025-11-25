import { useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

function StandardHeader({ title, showBack = false, backPath = "/dashboard", children }) {
  const navigate = useNavigate();

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
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}

export default StandardHeader;
