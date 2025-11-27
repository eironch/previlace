import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar isMobile={false} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3 md:hidden">
          <span className="text-lg font-bold text-gray-900">Previlace</span>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <Sidebar
        isMobile={true}
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
      />
    </div>
  );
}
