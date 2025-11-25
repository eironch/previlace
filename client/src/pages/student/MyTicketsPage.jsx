import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInquiryStore } from "../../store/inquiryStore";
import TicketCard from "../../components/inquiry/TicketCard";
import TicketDetail from "../../components/inquiry/TicketDetail";
import { Filter, MessageSquareOff, ArrowLeft } from "lucide-react";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { tickets, loading, getStudentTickets } = useInquiryStore();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getStudentTickets();
  }, [getStudentTickets]);

  const filteredTickets = (tickets || []).filter((ticket) => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Support Tickets</h1>
          <p className="mt-2 text-gray-600">
            View and manage your questions to instructors.
          </p>
        </div>

        <div className="grid h-[calc(100vh-200px)] gap-6 lg:grid-cols-3">
          {/* Ticket List */}
          <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-1">
            <div className="border-b border-gray-200 p-4">
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
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-lg bg-gray-100"
                    />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                  <MessageSquareOff className="mb-2 h-8 w-8 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className={`rounded-lg transition-all ${
                        selectedTicket?._id === ticket._id
                          ? "ring-2 ring-black"
                          : ""
                      }`}
                    >
                      <TicketCard
                        ticket={ticket}
                        onClick={() => setSelectedTicket(ticket)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:col-span-2 lg:block">
            {selectedTicket ? (
              <TicketDetail ticket={selectedTicket} isInstructor={false} />
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
