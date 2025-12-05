// Frontend validation utilities
import { useState, useCallback } from "react";
import {
  validateJobApplication,
  validateBaseResume,
  validateGenerateResume,
  getFieldError,
  formatValidationErrors,
  type ValidationError,
  type ValidationResult,
} from "../../../shared/validation";
import type {
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  CreateBaseResumeRequest,
  UpdateBaseResumeRequest,
  GenerateResumeRequest,
} from "@/types";

// Re-export validation functions
export {
  validateJobApplication,
  validateBaseResume,
  validateGenerateResume,
  getFieldError,
  formatValidationErrors,
  type ValidationError,
  type ValidationResult,
};

// Custom hook for form validation
export function useFormValidation<T>(
  validationFn: (data: T, isUpdate?: boolean) => ValidationResult
) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback(
    (data: T, isUpdate = false) => {
      const result = validationFn(data, isUpdate);
      setErrors(result.errors);
      setIsValid(result.valid);
      return result;
    },
    [validationFn]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  const getError = useCallback(
    (field: string) => {
      return getFieldError(errors, field);
    },
    [errors]
  );

  const hasError = useCallback(
    (field: string) => {
      return errors.some((e) => e.field === field);
    },
    [errors]
  );

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    getError,
    hasError,
  };
}

// Specific validation hooks for different forms
export function useJobApplicationValidation() {
  return useFormValidation<
    CreateJobApplicationRequest | UpdateJobApplicationRequest
  >(validateJobApplication);
}

export function useBaseResumeValidation() {
  return useFormValidation<CreateBaseResumeRequest | UpdateBaseResumeRequest>(
    validateBaseResume
  );
}

export function useGenerateResumeValidation() {
  return useFormValidation<GenerateResumeRequest>(validateGenerateResume);
}

// Helper function to display validation errors in UI
export function displayValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0].message;
  return formatValidationErrors(errors);
}

// Helper to check if a field has error and return error message
export function getFieldErrorMessage(
  errors: ValidationError[],
  field: string
): string | undefined {
  return getFieldError(errors, field);
}
