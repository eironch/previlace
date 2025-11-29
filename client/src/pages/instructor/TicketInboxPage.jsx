import React, { useState } from "react";
import { useTickets } from "../../hooks/useTickets";
import { useInquiryStore } from "../../store/inquiryStore";
import TicketCard from "../../components/inquiry/TicketCard";
import TicketDetail from "../../components/inquiry/TicketDetail";
import { Filter, CheckSquare, Square, CheckCircle, MessageSquareOff } from "lucide-react";
import StandardHeader from "../../components/ui/StandardHeader";

export default function TicketInboxPage() {
  const { useInstructorTickets, useTicket, refreshTickets } = useTickets();
  const { bulkUpdateTickets } = useInquiryStore();
  
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState(new Set());
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Fetch list
  const { tickets, isLoading: isListLoading } = useInstructorTickets(statusFilter === "all" ? null : statusFilter);

  // Fetch details for selected ticket (SWR handles caching, so this is efficient)
  const { ticket: currentTicket, isLoading: isDetailLoading } = useTicket(selectedTicketId);

  const handleTicketClick = (ticket) => {
    setSelectedTicketId(ticket._id);
  };

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
      refreshTickets();
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <StandardHeader
        title="Support Inbox"
        description="Manage student inquiries and support requests."
        onRefresh={refreshTickets}
        isRefreshing={isListLoading}
        endContent={
          selectedTicketIds.size > 0 && (
            <button
              onClick={handleBulkResolve}
              disabled={isBulkActionLoading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Resolve Selected ({selectedTicketIds.size})
            </button>
          )
        }
      />

      <div className="flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid h-full gap-6 lg:grid-cols-3">
          {/* Ticket List */}
          <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm lg:col-span-1 overflow-hidden">
            <div className="border-b border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Inbox</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {tickets?.length || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border-none bg-transparent text-sm font-medium text-gray-600 focus:ring-0 cursor-pointer"
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
              {isListLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                      </div>
                      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : tickets?.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                  <MessageSquareOff className="mb-2 h-8 w-8 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets?.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`relative rounded-lg transition-all ${
                        selectedTicketId === ticket._id
                          ? "ring-2 ring-black"
                          : ""
                        }`}
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={(e) => handleSelectTicket(ticket._id, e)}
                        className="absolute left-3 top-4 z-10 cursor-pointer text-gray-400 hover:text-black"
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
                          onClick={() => handleTicketClick(ticket)}
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
            {currentTicket ? (
              <TicketDetail ticket={currentTicket} isInstructor={true} />
            ) : isDetailLoading ? (
               <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
                  <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
               </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-500">
                <MessageSquareOff className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-lg font-medium">Select a ticket to view details</p>
                <p className="text-sm text-gray-400">Choose a ticket from the list to start responding</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
