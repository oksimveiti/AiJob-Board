// ==================== SHARED TYPES ====================
// This file contains types shared between frontend and backend
// Import this file in both projects to maintain type consistency

import type { LucideIcon } from "lucide-react";

// ==================== Application Status ====================
export type ApplicationStatusType =
  | "OPENING"
  | "APPLIED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED";

export const APPLICATION_STATUSES: ApplicationStatusType[] = [
  "OPENING",
  "APPLIED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
];

// ==================== Domain Models ====================

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  applicationDate: Date;
  status: ApplicationStatusType;
  location?: string | null;
  jobPostingLink?: string | null;
  salary?: string | null;
  notes?: string | null;
  jobDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseResume {
  id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedResume {
  id: string;
  userId: string;
  jobApplicationId: string;
  baseResumeId: string;
  content: string;
  jobTitle: string;
  companyName: string;
  customizations?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API Request Types ====================

export interface CreateJobApplicationRequest {
  companyName: string;
  jobTitle: string;
  applicationDate: string | Date;
  status?: ApplicationStatusType;
  location?: string;
  jobPostingLink?: string;
  salary?: string;
  notes?: string;
  jobDescription?: string;
}

export interface UpdateJobApplicationRequest {
  companyName?: string;
  jobTitle?: string;
  applicationDate?: string | Date;
  status?: ApplicationStatusType;
  location?: string;
  jobPostingLink?: string;
  salary?: string;
  notes?: string;
  jobDescription?: string;
}

export interface CreateBaseResumeRequest {
  name: string;
  content: string;
}

export interface UpdateBaseResumeRequest {
  name?: string;
  content?: string;
}

export interface GenerateResumeRequest {
  jobApplicationId: string;
  baseResumeId: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  jobDescription?: string;
  customRequirements?: string;
  baseResumeContent?: string;
}

export interface ActionItemsRequest {
  jobApplicationId: string;
  status: ApplicationStatusType;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  companyInfo?: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

// ==================== Frontend-Specific Types ====================

export interface KanbanColumnSpec {
  id: ApplicationStatusType;
  title: string;
  icon: LucideIcon;
  color: string;
}

export interface ApplicationFormData {
  companyName: string;
  jobTitle: string;
  applicationDate: string;
  location?: string;
  jobPostingLink?: string;
  salary?: string;
  notes?: string;
  jobDescription?: string;
}

export interface AIActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime?: string;
}

export interface AIModel {
  name: string;
  path: string;
  size: string;
  downloaded: boolean;
}

// ==================== Validation Types ====================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ==================== Utility Types ====================

export type JobApplicationWithRelations = JobApplication & {
  generatedResumes?: GeneratedResume[];
};

export type BaseResumeWithRelations = BaseResume & {
  generatedResumes?: GeneratedResume[];
};

export type GeneratedResumeWithRelations = GeneratedResume & {
  jobApplication?: JobApplication;
  baseResume?: BaseResume;
};

export interface AIActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime?: string;
}

export interface ResumeGenerationRequest {
  baseResumeId: string;
  jobApplicationId: string;
  jobDescription?: string;
  customRequirements?: string;
}

export interface AIModel {
  name: string;
  path: string;
  size: string;
  downloaded: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
