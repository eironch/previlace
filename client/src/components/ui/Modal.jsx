import { useEffect } from "react";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className={`relative max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-xl bg-white p-6 shadow-xl`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        {title && (
          <div className="mb-6 pr-8">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}

export default Modal;
