import { useNavigate } from "react-router-dom";

function StatCard({ title, value, unit, icon: Icon, onClick, navigateTo }) {
  const navigate = useNavigate();

  function handleClick() {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  }

  const isClickable = onClick || navigateTo;

  return (
    <div 
      onClick={handleClick}
      className={`rounded-lg border border-gray-300 bg-white p-4 shadow-sm ${
        isClickable ? "cursor-pointer transition-all hover:border-black hover:shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-[10px] text-gray-500">{unit}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
          <Icon className="h-5 w-5 text-gray-900" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
