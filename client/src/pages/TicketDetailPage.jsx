import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInquiryStore } from "../store/inquiryStore";
import TicketDetail from "../components/inquiry/TicketDetail";

function TicketDetailPage() {
  const { id } = useParams();
  const {
    currentTicket,
    getTicketById,
    addResponse,
    updateTicketStatus,
    addInternalNote,
    loading,
  } = useInquiryStore();

  useEffect(() => {
    getTicketById(id);
  }, [id, getTicketById]);

  async function handleAddResponse(message) {
    await addResponse(id, message);
  }

  async function handleUpdateStatus(status) {
    await updateTicketStatus(id, status);
  }

  async function handleAddInternalNote(note) {
    await addInternalNote(id, note);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!currentTicket) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">Ticket not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <TicketDetail
        ticket={currentTicket}
        onAddResponse={handleAddResponse}
        onUpdateStatus={handleUpdateStatus}
        onAddInternalNote={handleAddInternalNote}
      />
    </div>
  );
}

export default TicketDetailPage;
