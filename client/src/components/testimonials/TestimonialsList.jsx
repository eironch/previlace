export default function TestimonialsList({ useTestimonialsStore, onSelectForReview }) {
  const { testimonials } = useTestimonialsStore();

  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    return <p className="text-gray-500 text-center">No testimonials found.</p>;
  }

  return (
    <div className="space-y-4">
      {testimonials.map((t) => (
        <div
          key={t._id}
          className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50"
        >
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-sm text-gray-600 italic">"{t.content}"</p>
          </div>
          <Button size="sm" onClick={() => onSelectForReview(t)}>
            Review
          </Button>
        </div>
      ))}
    </div>
  );
}
