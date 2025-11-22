import React, { useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import TicketForm from "./TicketForm";

export default function AskQuestionButton({ subjectId, topicId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-label="Ask a Question"
      >
        <MessageCircleQuestion className="h-7 w-7" />
      </button>

      {isModalOpen && (
        <TicketForm
          subjectId={subjectId}
          topicId={topicId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
