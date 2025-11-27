import React, { useEffect, useState } from "react";
import { useInquiryStore } from "../../store/inquiryStore";
import TicketCard from "../../components/inquiry/TicketCard";
import TicketDetail from "../../components/inquiry/TicketDetail";
import { Filter, CheckSquare, Square, CheckCircle } from "lucide-react";

export default function TicketInboxPage() {
  const {
    tickets,
    loading,
    getInstructorTickets,
    bulkUpdateTickets,
  } = useInquiryStore();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("open"); // Default to open tickets
  const [selectedTicketIds, setSelectedTicketIds] = useState(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  useEffect(() => {
    getInstructorTickets(statusFilter === "all" ? null : statusFilter);
  }, [getInstructorTickets, statusFilter]);

  const handleSelectTicket = (id, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedTicketIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTicketIds(newSelected);
  };

  const handleBulkResolve = async () => {
    if (selectedTicketIds.size === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to resolve ${selectedTicketIds.size} tickets?`
      )
    )
      return;

    setIsBulkActionLoading(true);
    try {
      await bulkUpdateTickets({
        ticketIds: Array.from(selectedTicketIds),
        action: "status",
        value: "resolved",
      });
      setSelectedTicketIds(new Set());
      getInstructorTickets(statusFilter === "all" ? null : statusFilter);
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ticket Inbox</h1>
            <p className="mt-2 text-gray-600">
              Manage student inquiries and support requests.
            </p>
          </div>
          {selectedTicketIds.size > 0 && (
            <button
              onClick={handleBulkResolve}
              disabled={isBulkActionLoading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Resolve Selected ({selectedTicketIds.size})
            </button>
          )}
        </div>

        <div className="grid h-[calc(100vh-200px)] gap-6 lg:grid-cols-3">
          {/* Ticket List */}
          <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm lg:col-span-1">
            <div className="border-b border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Inbox</span>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {tickets.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border-none bg-transparent text-sm font-medium text-gray-600 focus:ring-0"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="all">All Tickets</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-gray-500">
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`relative rounded-lg transition-all ${
                        selectedTicket?._id === ticket._id
                          ? "ring-2 ring-black"
                          : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={(e) => handleSelectTicket(ticket._id, e)}
                        className="absolute left-2 top-2 z-10 cursor-pointer text-gray-400 hover:text-black"
                      >
                        {selectedTicketIds.has(ticket._id) ? (
                          <CheckSquare className="h-5 w-5 text-black" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="pl-8">
                        <TicketCard
                          ticket={ticket}
                          onClick={() => setSelectedTicket(ticket)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm lg:col-span-2 lg:block">
            {selectedTicket ? (
              <TicketDetail ticket={selectedTicket} isInstructor={true} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
