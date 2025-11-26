import { useState, useEffect } from "react";
import {
  Search,
  Download,
  UserX,
  UserCheck,
  Shield,
  ShieldOff,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import useUserManagementStore from "@/store/userManagementStore";
import useAdminCacheStore from "@/store/adminCacheStore";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import UserGeneratorModal from "@/components/admin/UserGeneratorModal";
import StandardHeader from "@/components/ui/StandardHeader";
import AdminSkeleton from "@/components/ui/AdminSkeleton";
import { formatDistanceToNow } from "date-fns";

function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  const {
    users,
    pagination,
    filters,
    selectedUsers,
    isLoading,
    fetchUsers,
    setFilter,
    setPage,
    setLimit,
    toggleUserSelection,
    selectAllUsers,
    deselectAllUsers,
    updateUserStatus,
    performBulkAction,
    resetFilters,
  } = useUserManagementStore();

  const { getCachedData, setCachedData } = useAdminCacheStore();
  const CACHE_KEY = 'user-management-data';

  useEffect(() => {
    loadData();
  }, [filters, pagination.currentPage, pagination.limit]);

  async function loadData() {
    // Only use cache for initial load or if filters are default
    const isDefaultView = pagination.currentPage === 1 && 
                          filters.search === "" && 
                          filters.role === "all" && 
                          filters.status === "all";
    
    if (isDefaultView) {
        const cached = getCachedData(CACHE_KEY);
        if (cached) {
            useUserManagementStore.setState({
                users: cached.data.users,
                pagination: cached.data.pagination,
                isLoading: false
            });
            setIsLoadingCache(false);
            if (!cached.isStale) return;
        }
    }

    await fetchUsers();
    
    if (isDefaultView) {
        const state = useUserManagementStore.getState();
        setCachedData(CACHE_KEY, { users: state.users, pagination: state.pagination });
    }
    setIsLoadingCache(false);
  }

  function handleSearch(e) {
    setFilter("search", e.target.value);
    setPage(1);
  }

  function handleFilterChange(filterKey, value) {
    setFilter(filterKey, value);
    setPage(1);
  }

  function handleSort(sortBy) {
    if (filters.sortBy === sortBy) {
      setFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      setFilter("sortBy", sortBy);
      setFilter("sortOrder", "desc");
    }
  }

  async function handleUserAction(userId, action) {
    setActionLoading(`${userId}-${action}`);
    const result = await updateUserStatus(userId, action);
    setActionLoading(null);

    if (!result.success && process.env.NODE_ENV === "development") {
      console.error("User action failed:", result.error);
    }
  }

  async function handleBulkActionConfirm() {
    if (!bulkAction) return;

    const result = await performBulkAction(bulkAction);
    setShowBulkConfirm(false);
    setBulkAction(null);

    if (!result.success && process.env.NODE_ENV === "development") {
      console.error("Bulk action failed:", result.error);
    }
  }

  function handleViewDetails(user) {
    setSelectedUser(user);
    setShowDetailsModal(true);
  }

  function getUserStatusBadge(user) {
    if (user.isSuspended) {
      return (
        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          Suspended
        </span>
      );
    }
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      return (
        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
          Locked
        </span>
      );
    }
    if (!user.isEmailVerified) {
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          Unverified
        </span>
      );
    }
    if (
      user.lastLogin &&
      new Date(user.lastLogin) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      return (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
        Inactive
      </span>
    );
  }

  const isAllSelected =
    selectedUsers.length === users.length && users.length > 0;



  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        title="User Management" 
        description="Manage and monitor all system users"
        onRefresh={fetchUsers}
      >
        <button
            onClick={() => setShowGeneratorModal(true)}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm w-full sm:w-auto"
        >
            <UserPlus className="h-4 w-4" />
            <span>Generate User</span>
        </button>
      </StandardHeader>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoadingCache && users.length === 0 ? (
          <AdminSkeleton />
        ) : (
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                    <option value="suspended">Suspended</option>
                    <option value="locked">Locked</option>
                </select>

                <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                    Clear Filters
                </button>
                </div>

                <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    Export
                </button>
                </div>
            </div>

            {selectedUsers.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
                <span className="font-medium text-blue-700">
                    {selectedUsers.length} users selected
                </span>
                <div className="flex gap-2">
                    <button
                    onClick={() => {
                        setBulkAction("suspend");
                        setShowBulkConfirm(true);
                    }}
                    className="rounded bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
                    >
                    Suspend Selected
                    </button>
                    <button
                    onClick={() => {
                        setBulkAction("activate");
                        setShowBulkConfirm(true);
                    }}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-700"
                    >
                    Activate Selected
                    </button>
                    <button
                    onClick={deselectAllUsers}
                    className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-700"
                    >
                    Clear Selection
                    </button>
                </div>
                </div>
            )}
            </div>

            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={
                        isAllSelected ? deselectAllUsers : selectAllUsers
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    </th>
                    <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort("firstName")}
                    >
                    User
                    </th>
                    <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort("email")}
                    >
                    Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Exam Type
                    </th>
                    <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort("lastLogin")}
                    >
                    Last Active
                    </th>
                    <th
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    onClick={() => handleSort("createdAt")}
                    >
                    Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                    <tr>
                    <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-gray-500"
                    >
                        Loading users...
                    </td>
                    </tr>
                ) : users.length === 0 ? (
                    <tr>
                    <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-gray-500"
                    >
                        No users found
                    </td>
                    </tr>
                ) : (
                    users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                        <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar ? (
                                <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar}
                                alt={user.firstName}
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                <span className="font-medium text-gray-600">
                                    {user.firstName?.[0]?.toUpperCase() || "U"}
                                </span>
                                </div>
                            )}
                            </div>
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                            </div>
                            {user.isProfileComplete && (
                                <CheckCircle className="ml-1 inline h-4 w-4 text-green-500" />
                            )}
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                        </td>
                        <td className="px-6 py-4">
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            {user.role}
                        </span>
                        </td>
                        <td className="px-6 py-4">{getUserStatusBadge(user)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                        {user.examType || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLogin
                            ? formatDistanceToNow(new Date(user.lastLogin), {
                                addSuffix: true,
                            })
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                        })}
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                            <button
                            onClick={() => handleViewDetails(user)}
                            className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                            title="View Details"
                            >
                            <Eye className="h-4 w-4" />
                            </button>

                            {user.isSuspended ? (
                            <button
                                onClick={() =>
                                handleUserAction(user._id, "activate")
                                }
                                disabled={
                                actionLoading === `${user._id}-activate`
                                }
                                className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50"
                                title="Activate User"
                            >
                                <UserCheck className="h-4 w-4" />
                            </button>
                            ) : (
                            <button
                                onClick={() =>
                                handleUserAction(user._id, "suspend")
                                }
                                disabled={actionLoading === `${user._id}-suspend`}
                                className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                                title="Suspend User"
                            >
                                <UserX className="h-4 w-4" />
                            </button>
                            )}

                            {user.lockUntil &&
                            new Date(user.lockUntil) > new Date() && (
                                <button
                                onClick={() =>
                                    handleUserAction(user._id, "unlock")
                                }
                                disabled={actionLoading === `${user._id}-unlock`}
                                className="rounded p-1.5 text-orange-600 transition-colors hover:bg-orange-50"
                                title="Unlock User"
                                >
                                <Unlock className="h-4 w-4" />
                                </button>
                            )}

                            {user.role === "user" ? (
                            <button
                                onClick={() =>
                                handleUserAction(user._id, "makeAdmin")
                                }
                                disabled={
                                actionLoading === `${user._id}-makeAdmin`
                                }
                                className="rounded p-1.5 text-purple-600 transition-colors hover:bg-purple-50"
                                title="Make Admin"
                            >
                                <Shield className="h-4 w-4" />
                            </button>
                            ) : (
                            user.role === "admin" && (
                                <button
                                onClick={() =>
                                    handleUserAction(user._id, "removeAdmin")
                                }
                                disabled={
                                    actionLoading === `${user._id}-removeAdmin`
                                }
                                className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-50"
                                title="Remove Admin"
                            >
                                <ShieldOff className="h-4 w-4" />
                                </button>
                            )
                            )}
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalUsers
                    )}{" "}
                    of {pagination.totalUsers} users
                </span>
                <select
                    value={pagination.limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    className="rounded border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
                </div>

                <div className="flex gap-2">
                <button
                    onClick={() => setPage(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded border border-gray-300 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                    <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`rounded border px-3 py-1.5 transition-colors ${
                        pagination.currentPage === pageNum
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        {pageNum}
                    </button>
                    );
                })}

                <button
                    onClick={() => setPage(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded border border-gray-300 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showGeneratorModal && (
        <UserGeneratorModal
          onClose={() => setShowGeneratorModal(false)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}

      {showBulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Confirm Bulk Action</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to {bulkAction} {selectedUsers.length}{" "}
              selected users?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkConfirm(false);
                  setBulkAction(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkActionConfirm}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
