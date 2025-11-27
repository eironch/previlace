import { useState, useEffect } from "react";
import { Search, MapPin, Users, Loader } from "lucide-react";
import Button from "../ui/Button";
import { Input } from "../ui/Input";
import useStudyGroupStore from "../../store/studyGroupStore";

export default function StudyGroupBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    publicGroups,
    pagination,
    fetchPublicGroups,
    joinGroup,
    joinGroupByCode,
  } = useStudyGroupStore();

  useEffect(() => {
    setLoading(true);
    fetchPublicGroups({
      search,
      category,
      page,
      limit: 12,
    }).finally(() => setLoading(false));
  }, [search, category, page, fetchPublicGroups]);

  const handleJoinGroup = async (groupId) => {
    await joinGroup(groupId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Discover Study Groups
          </h1>
          <p className="mt-2 text-slate-600">
            Join a group and collaborate with fellow learners
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900"
            >
              <option value="all">All Categories</option>
              <option value="professional">Professional</option>
              <option value="sub-professional">Sub-Professional</option>
              <option value="mixed">Mixed</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicGroups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  onJoin={() => handleJoinGroup(group._id)}
                />
              ))}
            </div>

            {publicGroups.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-600">
                  No groups found. Try adjusting your search.
                </p>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    className="min-w-10"
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, onJoin }) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h3 className="truncate text-xl font-semibold text-slate-900">
          {group.name}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600">
          {group.description}
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4" />
          <span>{group.stats.totalMembers} members</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span className="capitalize">{group.category}</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {group.studyGoals.slice(0, 2).map((goal, i) => (
          <span
            key={i}
            className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
          >
            {goal}
          </span>
        ))}
        {group.studyGoals.length > 2 && (
          <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            +{group.studyGoals.length - 2} more
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <Button
          onClick={onJoin}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Join Group
        </Button>
      </div>
    </div>
  );
}
