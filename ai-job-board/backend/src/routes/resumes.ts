import express from "express";
import { z } from "zod";
import { prisma } from "../server";
import { authenticateUser } from "../middleware/auth";
import {
  ApiResponse,
  CreateBaseResumeRequest,
  UpdateBaseResumeRequest,
  AuthenticatedRequest,
} from "../types";

const router = express.Router();

// Validation schemas
const createBaseResumeSchema = z.object({
  name: z.string().min(1, "Resume name is required"),
  content: z.string().min(10, "Resume content must be at least 10 characters"),
});

const updateBaseResumeSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().min(10).optional(),
});

// Middleware
router.use(authenticateUser);

// GET /api/resumes
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const resumes = await prisma.baseResume.findMany({
      where: {
        userId: req.user!.id,
      },
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
    });

    res.json({
      success: true,
      data: resumes,
    } as ApiResponse);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch resumes",
    } as ApiResponse);
  }
});

// GET /api/resumes/base
router.get("/base", async (req: AuthenticatedRequest, res) => {
  try {
    const baseResume = await prisma.baseResume.findFirst({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json({
      success: true,
      data: baseResume,
    } as ApiResponse);
  } catch (error) {
    console.error("Error fetching base resume:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch base resume",
    } as ApiResponse);
  }
});

// GET /api/resumes/:id
router.get("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const resume = await prisma.baseResume.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        generatedResumes: {
          include: {
            jobApplication: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Resume not found",
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: resume,
    } as ApiResponse);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch resume",
    } as ApiResponse);
  }
});

// POST /api/resumes
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const validationResult = createBaseResumeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
    }

    const data = validationResult.data;
    const resume = await prisma.baseResume.create({
      data: {
        ...data,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: resume,
      message: "Resume created successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create resume",
    } as ApiResponse);
  }
});

// PUT /api/resumes/:id
router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateBaseResumeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: validationResult.error.errors.map((e) => e.message).join(", "),
      } as ApiResponse);
    }

    const data = validationResult.data;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.baseResume.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingResume) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Resume not found",
      } as ApiResponse);
    }

    const resume = await prisma.baseResume.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      data: resume,
      message: "Resume updated successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update resume",
    } as ApiResponse);
  }
});

// DELETE /api/resumes/:id
router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.baseResume.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingResume) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Resume not found",
      } as ApiResponse);
    }

    await prisma.baseResume.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Resume deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete resume",
    } as ApiResponse);
  }
});

export default router;
