import { useState } from "react";
import Button from "../ui/Button";

export default function TestimonialActionModal({ testimonial, onClose, onSubmit }) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Review Testimonial</h3>
        <p className="text-gray-600 italic mb-2">"{testimonial.content}"</p>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={4}
          placeholder="Add notes (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onSubmit("rejected", notes)}>
            Reject
          </Button>
          <Button variant="outline" onClick={() => onSubmit("requested_changes", notes)}>
            Request Changes
          </Button>
          <Button onClick={() => onSubmit("approved", notes)}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
