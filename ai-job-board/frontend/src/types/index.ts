// Re-export shared types
export type {
  ApplicationStatusType,
  JobApplication,
  BaseResume,
  GeneratedResume,
  User,
  KanbanColumnSpec,
  ApplicationFormData,
  AIActionItem,
  AIModel,
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

// Frontend-specific types that don't need to be shared
export interface UIState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}
