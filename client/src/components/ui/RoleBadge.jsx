function RoleBadge({ role }) {
  const getRoleBadgeStyles = function () {
    switch (role) {
      case "super_admin":
        return "rounded-full bg-black px-3 py-1 text-xs font-semibold text-white";
      case "admin":
        return "rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-white";
      case "student":
        return "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900";
      default:
        return "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900";
    }
  };

  const getRoleLabel = function () {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  return <span className={getRoleBadgeStyles()}>{getRoleLabel()}</span>;
}

export default RoleBadge;
