import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, MapPin, Filter } from "lucide-react";
import { jobService } from "../../services/jobService";
import JobCard from "../../components/career/JobCard";

export default function JobBoardPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    location: "",
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.getJobs(filters);
      setJobs(response.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          
          {/* 🚀 Top Navigation/Action Row (Upper Right) */}
          <div className="flex justify-end items-center mb-6">
            {/* Upper Right: Resume Builder Call to Action */}
            <button
              onClick={() => navigate("/dashboard/resume")}
              className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-800 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Build My Resume
            </button>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Find Your Dream Job
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse hundreds of opportunities from top construction and engineering firms.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 mx-auto max-w-3xl">
            <div className="flex gap-2 rounded-lg bg-white p-2 shadow-lg ring-1 ring-gray-200">
              <div className="flex-1 flex items-center px-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full border-none bg-transparent focus:ring-0 text-gray-900 placeholder-gray-500"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="flex-1 flex items-center px-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="City or remote"
                  className="w-full border-none bg-transparent focus:ring-0 text-gray-900 placeholder-gray-500"
                />
              </div>
              <button className="rounded-lg bg-black px-8 py-3 font-semibold text-white hover:bg-gray-800 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar (Placeholder) */}
          <div className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Type</h3>
                <div className="space-y-3">
                  {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                    <label key={type} className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {(jobs || []).length} Jobs Found
              </h2>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 lg:hidden">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {(jobs || []).map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
