import { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import apiClient from "../services/apiClient";

export default function InstructorTicketInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, resolved
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const response = await apiClient.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(ticketId) {
    try {
      await apiClient.patch(`/tickets/${ticketId}/resolve`, {
        status: "resolved",
        resolution: "Marked as resolved by instructor",
      });
      // Optimistic update
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? { ...t, status: "resolved", resolvedAt: new Date() }
            : t
        )
      );
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter =
      filter === "all" ? true : ticket.status === filter;
    const matchesSearch =
      ticket.message.toLowerCase().includes(search.toLowerCase()) ||
      ticket.studentId?.firstName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      ticket.studentId?.lastName
        ?.toLowerCase()
        .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Student Inquiries
          </h2>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {tickets.filter((t) => t.status === "open").length} Open
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="h-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tickets found matching your criteria.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket._id} className="p-4 hover:bg-gray-50">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {ticket.studentId?.firstName?.[0] || "S"}
                    {ticket.studentId?.lastName?.[0] || "T"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.studentId?.firstName} {ticket.studentId?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    ticket.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ticket.status === "resolved" ? "Resolved" : "Open"}
                </span>
              </div>

              <div className="mb-3 pl-10">
                <p className="text-sm text-gray-800">{ticket.message}</p>
                {ticket.subjectId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Subject: {ticket.subjectId.name || "Unknown"}
                  </p>
                )}
              </div>

              <div className="flex justify-end pl-10">
                {ticket.status === "open" && (
                  <button
                    onClick={() => handleResolve(ticket._id)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
