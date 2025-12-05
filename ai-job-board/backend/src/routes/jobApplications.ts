import express from "express";
import { z } from "zod";
import { prisma } from "../server";
import { authenticateUser } from "../middleware/auth";
import {
  ApiResponse,
  PaginatedResponse,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  ApplicationStatus,
  AuthenticatedRequest,
} from "../types";
import {
  validateJobApplication,
  formatValidationErrors,
} from "../../../shared/validation";

const router = express.Router();

// TODO: move validation schemas to separate file
// Validation schemas
const createJobApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  applicationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid application date format",
  }),
  status: z
    .enum([
      "OPENING",
      "APPLIED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWING",
      "OFFER",
      "REJECTED",
    ])
    .optional(),
  location: z.string().optional(),
  jobPostingLink: z.string().url().optional().or(z.literal("")),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

const updateJobApplicationSchema = z.object({
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  applicationDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .optional(),
  status: z
    .enum([
      "OPENING",
      "APPLIED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWING",
      "OFFER",
      "REJECTED",
    ])
    .optional(),
  location: z.string().optional(),
  jobPostingLink: z.string().url().optional().or(z.literal("")),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

// Middleware
router.use(authenticateUser);

// GET /api/job-applications
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const { page = "1", limit = "50", status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      userId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }

    const [jobApplications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          generatedResumes: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const response: PaginatedResponse = {
      data: jobApplications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    res.json({
      success: true,
      data: response,
    } as ApiResponse);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch job applications",
    } as ApiResponse);
  }
});

// GET /api/job-applications/:id
router.get("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        generatedResumes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Job application not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: jobApplication,
    } as ApiResponse);
  } catch (error) {
    console.error("Error fetching job application:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch job application",
    } as ApiResponse);
  }
});

// POST /api/job-applications
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    // Use shared validation
    const sharedValidation = validateJobApplication(
      req.body as CreateJobApplicationRequest
    );
    if (!sharedValidation.valid) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: formatValidationErrors(sharedValidation.errors),
        validationErrors: sharedValidation.errors,
      } as ApiResponse);
    }

    // Zod validation for additional type safety
    const validationResult = createJobApplicationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
    }

    const data = validationResult.data;
    const jobApplication = await prisma.jobApplication.create({
      data: {
        ...data,
        applicationDate: new Date(data.applicationDate),
        userId: req.user!.id,
        status: data.status || "OPENING",
      },
      include: {
        generatedResumes: true,
      },
    });

    res.status(201).json({
      success: true,
      data: jobApplication,
      message: "Job application created successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error creating job application:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create job application",
    } as ApiResponse);
  }
});

// PUT /api/job-applications/:id
router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateJobApplicationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
    }

    const data = validationResult.data;

    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Job application not found",
      } as ApiResponse);
    }

    const updateData: any = { ...data };
    if (data.applicationDate) {
      updateData.applicationDate = new Date(data.applicationDate);
    }

    const jobApplication = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        generatedResumes: true,
      },
    });

    res.json({
      success: true,
      data: jobApplication,
      message: "Job application updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error updating job application:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update job application",
    } as ApiResponse);
  }
});

// PATCH /api/job-applications/:id
router.patch("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateJobApplicationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
    }

    const data = validationResult.data;

    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Job application not found",
      } as ApiResponse);
    }

    const updateData: any = { ...data };
    if (data.applicationDate) {
      updateData.applicationDate = new Date(data.applicationDate);
    }

    const jobApplication = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        generatedResumes: true,
      },
    });

    res.json({
      success: true,
      data: jobApplication,
      message: "Job application updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error updating job application:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update job application",
    } as ApiResponse);
  }
});

// DELETE /api/job-applications/:id
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if job application exists and belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Job application not found",
      } as ApiResponse);
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Job application deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error deleting job application:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete job application",
    } as ApiResponse);
  }
});

export default router;
