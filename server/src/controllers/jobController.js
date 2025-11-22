import Job from "../models/Job.js";
import { AppError } from "../utils/AppError.js";

async function createJob(req, res, next) {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
}

async function getJobs(req, res, next) {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      // Default to showing only active jobs for non-admin/instructors or public view
      // If admin/instructor wants to see all, they should specify or we can adjust logic
      query.status = "active";
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .populate("postedBy", "firstName lastName avatar");

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
}

async function getJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "firstName lastName avatar"
    );

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
}

async function updateJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    // Only allow owner or admin to update
    if (
      job.postedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Not authorized to update this job", 403);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    // Only allow owner or admin to delete
    if (
      job.postedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Not authorized to delete this job", 403);
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export { createJob, getJobs, getJob, updateJob, deleteJob };
