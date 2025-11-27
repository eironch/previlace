import React from "react";
import { MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobCard({ job, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-gray-300 bg-white p-6 transition-all hover:border-black hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-xl font-bold text-gray-900">
            {job.company.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-black">
              {job.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Building2 className="h-3 w-3" />
              <span>{job.company}</span>
            </div>
          </div>
        </div>
        {job.type && (
          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {job.type}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900">
              {job.salary.currency} {job.salary.min?.toLocaleString()} -{" "}
              {job.salary.max?.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(new Date(job.createdAt))} ago</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.tags?.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
