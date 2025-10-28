import { useBookmarkStore } from "../../store/bookmarkStore";

function BookmarkButton({ questionId, priority = "medium" }) {
  const isBookmarked = useBookmarkStore((state) =>
    state.isQuestionBookmarked(questionId)
  );
  const createBookmark = useBookmarkStore((state) => state.createBookmark);
  const deleteBookmark = useBookmarkStore((state) => state.deleteBookmark);
  const getBookmarkForQuestion = useBookmarkStore(
    (state) => state.getBookmarkForQuestion
  );

  const handleBookmarkToggle = async () => {
    if (isBookmarked) {
      const bookmark = getBookmarkForQuestion(questionId);
      if (bookmark) {
        await deleteBookmark(bookmark._id);
      }
    } else {
      await createBookmark(questionId, "", priority);
    }
  };

  return (
    <button
      onClick={handleBookmarkToggle}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
        isBookmarked
          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}

export default BookmarkButton;
