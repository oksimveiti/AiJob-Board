// ==================== SHARED VALIDATION UTILITIES ====================
// Validation functions shared between frontend and backend

import type {
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  CreateBaseResumeRequest,
  UpdateBaseResumeRequest,
  GenerateResumeRequest,
  ApplicationStatusType,
  ValidationError,
  ValidationResult,
} from "./types";


import { APPLICATION_STATUSES } from "./types";

export type { ValidationError, ValidationResult };

// ==================== Validation Rules ====================

export const VALIDATION_RULES = {
  companyName: {
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  jobTitle: {
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  location: {
    maxLength: 200,
    required: false,
  },
  salary: {
    maxLength: 100,
    required: false,
  },
  notes: {
    maxLength: 5000,
    required: false,
  },
  jobDescription: {
    maxLength: 10000,
    required: false,
  },
  resumeName: {
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  resumeContent: {
    minLength: 10,
    maxLength: 50000,
    required: true,
  },
  url: {
    pattern: /^https?:\/\/.+/i,
    required: false,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  },
};

// ==================== Helper Functions ====================

export function isValidUrl(url: string): boolean {
  if (!url) return true; // Empty URLs are valid (optional field)
  try {
    new URL(url);
    return VALIDATION_RULES.url.pattern.test(url);
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

export function isValidDate(date: string | Date): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function isValidStatus(status: string): status is ApplicationStatusType {
  return APPLICATION_STATUSES.includes(status as ApplicationStatusType);
}

// ==================== Validation Functions ====================

export function validateJobApplication(
  data: CreateJobApplicationRequest | UpdateJobApplicationRequest,
  isUpdate = false
): ValidationResult {
  const errors: ValidationError[] = [];

  // Company Name
  if ("companyName" in data) {
    if (!isUpdate && !data.companyName) {
      errors.push({
        field: "companyName",
        message: "Company name is required",
      });
    } else if (data.companyName) {
      if (data.companyName.length < VALIDATION_RULES.companyName.minLength) {
        errors.push({
          field: "companyName",
          message: "Company name is too short",
        });
      }
      if (data.companyName.length > VALIDATION_RULES.companyName.maxLength) {
        errors.push({
          field: "companyName",
          message: "Company name is too long",
        });
      }
    }
  }

  // Job Title
  if ("jobTitle" in data) {
    if (!isUpdate && !data.jobTitle) {
      errors.push({ field: "jobTitle", message: "Job title is required" });
    } else if (data.jobTitle) {
      if (data.jobTitle.length < VALIDATION_RULES.jobTitle.minLength) {
        errors.push({ field: "jobTitle", message: "Job title is too short" });
      }
      if (data.jobTitle.length > VALIDATION_RULES.jobTitle.maxLength) {
        errors.push({ field: "jobTitle", message: "Job title is too long" });
      }
    }
  }

  // Application Date
  if ("applicationDate" in data) {
    if (!isUpdate && !data.applicationDate) {
      errors.push({
        field: "applicationDate",
        message: "Application date is required",
      });
    } else if (data.applicationDate && !isValidDate(data.applicationDate)) {
      errors.push({ field: "applicationDate", message: "Invalid date format" });
    }
  }

  // Status
  if ("status" in data && data.status && !isValidStatus(data.status)) {
    errors.push({ field: "status", message: "Invalid application status" });
  }

  // Location (optional)
  if (
    data.location &&
    data.location.length > VALIDATION_RULES.location.maxLength
  ) {
    errors.push({ field: "location", message: "Location is too long" });
  }

  // Job Posting Link (optional)
  if (data.jobPostingLink && !isValidUrl(data.jobPostingLink)) {
    errors.push({ field: "jobPostingLink", message: "Invalid URL format" });
  }

  // Salary (optional)
  if (data.salary && data.salary.length > VALIDATION_RULES.salary.maxLength) {
    errors.push({ field: "salary", message: "Salary is too long" });
  }

  // Notes (optional)
  if (data.notes && data.notes.length > VALIDATION_RULES.notes.maxLength) {
    errors.push({ field: "notes", message: "Notes are too long" });
  }

  // Job Description (optional)
  if (
    data.jobDescription &&
    data.jobDescription.length > VALIDATION_RULES.jobDescription.maxLength
  ) {
    errors.push({
      field: "jobDescription",
      message: "Job description is too long",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateBaseResume(
  data: CreateBaseResumeRequest | UpdateBaseResumeRequest,
  isUpdate = false
): ValidationResult {
  const errors: ValidationError[] = [];

  // Name
  if ("name" in data) {
    if (!isUpdate && !data.name) {
      errors.push({ field: "name", message: "Resume name is required" });
    } else if (data.name) {
      if (data.name.length < VALIDATION_RULES.resumeName.minLength) {
        errors.push({ field: "name", message: "Resume name is too short" });
      }
      if (data.name.length > VALIDATION_RULES.resumeName.maxLength) {
        errors.push({ field: "name", message: "Resume name is too long" });
      }
    }
  }

  // Content
  if ("content" in data) {
    if (!isUpdate && !data.content) {
      errors.push({ field: "content", message: "Resume content is required" });
    } else if (data.content) {
      if (data.content.length < VALIDATION_RULES.resumeContent.minLength) {
        errors.push({
          field: "content",
          message: "Resume content is too short",
        });
      }
      if (data.content.length > VALIDATION_RULES.resumeContent.maxLength) {
        errors.push({
          field: "content",
          message: "Resume content is too long (max 50,000 characters)",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateGenerateResume(
  data: GenerateResumeRequest
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.jobApplicationId) {
    errors.push({
      field: "jobApplicationId",
      message: "Job application ID is required",
    });
  }

  if (!data.baseResumeId) {
    errors.push({
      field: "baseResumeId",
      message: "Base resume ID is required",
    });
  }

  if (data.customRequirements && data.customRequirements.length > 1000) {
    errors.push({
      field: "customRequirements",
      message: "Custom requirements are too long (max 1,000 characters)",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== Error Formatting ====================

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join(", ");
}

export function getFieldError(
  errors: ValidationError[],
  field: string
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}
