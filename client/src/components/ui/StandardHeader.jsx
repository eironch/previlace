import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

function StandardHeader({ 
  title, 
  description,
  showBack = false, 
  backPath = "/dashboard", 
  onBack,
  onRefresh, 
  refreshLabel = "Refresh",
  isRefreshing = false,
  startContent,
  bottomContent,
  children 
}) {
  const navigate = useNavigate();

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      navigate(backPath);
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {startContent}
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 pl-0 text-gray-600 hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="inline">{refreshLabel}</span>
              </Button>
            )}
            {children}
          </div>
          </div>

        {bottomContent && (
          <div className="mt-4">
            {bottomContent}
          </div>
        )}
      </div>
    </header>
  );
}

export default StandardHeader;
