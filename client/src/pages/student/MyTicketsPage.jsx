import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import TicketCard from "../../components/inquiry/TicketCard";
import TicketDetail from "../../components/inquiry/TicketDetail";
import { Filter, MessageSquareOff } from "lucide-react";
import StandardHeader from "@/components/ui/StandardHeader";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { useStudentTickets, useTicket, refreshTickets } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { tickets, isLoading: isListLoading } = useStudentTickets(statusFilter);
  
  // Fetch full details for the selected ticket
  const { ticket: selectedTicket, isLoading: isDetailLoading } = useTicket(selectedTicketId);

  // We don't filter client-side anymore as the hook handles it via API params
  // But for consistency with the UI selector if the API doesn't support all filters perfectly yet:
  const filteredTickets = tickets || [];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <StandardHeader 
        title="Support Center" 
        description="View and manage your support tickets"
        onRefresh={refreshTickets}
      />

      <div className="flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid h-full gap-6 lg:grid-cols-3">
          {/* Ticket List */}
          <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm lg:col-span-1 overflow-hidden">
            <div className="border-b border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Tickets</h2>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border-none bg-transparent text-sm font-medium text-gray-600 focus:ring-0"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
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
              ) : filteredTickets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                  <MessageSquareOff className="mb-2 h-8 w-8 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket, index) => (
                    <div
                      key={ticket._id || index}
                      className={`rounded-lg transition-all ${
                        selectedTicketId === ticket._id
                          ? "ring-2 ring-black"
                          : ""
                      }`}
                    >
                      <TicketCard
                        ticket={ticket}
                        onClick={() => setSelectedTicketId(ticket._id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm lg:col-span-2 lg:block">
            {selectedTicket ? (
              <TicketDetail ticket={selectedTicket} isInstructor={false} />
            ) : isDetailLoading && selectedTicketId ? (
               <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
                  <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
               </div>
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
