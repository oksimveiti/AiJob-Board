import { Request } from "express";
import { User } from "@prisma/client";

// Re-export shared types
export type {
  ApplicationStatusType,
  JobApplication,
  BaseResume,
  GeneratedResume,
  User as SharedUser,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  CreateBaseResumeRequest,
  UpdateBaseResumeRequest,
  GenerateResumeRequest,
  ActionItemsRequest,
  ValidationError,
  ValidationResult,
  JobApplicationWithRelations,
  BaseResumeWithRelations,
  GeneratedResumeWithRelations,
} from "../../../shared/types";

export { APPLICATION_STATUSES } from "../../../shared/types";

// Backend-specific types
export type ApplicationStatus =
  | "OPENING"
  | "APPLIED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED";

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
}
