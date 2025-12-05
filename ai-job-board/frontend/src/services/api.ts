import {
  API_BASE_URL,
  AI_GENERATE,
  AI_ACTION_ITEMS,
  JOB_APPLICATIONS_API,
} from "@/config/constants";
import type { JobApplication, BaseResume, GeneratedResume } from "@/types";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "X-User-ID": "demo-user",
});

export const testAPIConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

interface ResumeGenerationRequest {
  jobApplicationId: string;
  baseResumeId: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  jobDescription?: string;
  customRequirements?: string;
  baseResumeContent?: string; // Actual resume content for AI modification
}

interface ActionItemsRequest {
  jobApplicationId: string;
  jobDescription?: string;
  companyInfo?: string;
}

// ==================== Base Resume API ====================

// Get base resume (first one for the user)
export const getBaseResume = async (): Promise<{
  success: boolean;
  data?: BaseResume;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/base`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.message || "Failed to fetch base resume");
    }
  } catch (error) {
    console.error("Error fetching base resume:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch base resume",
    };
  }
};

// Create base resume
export const createBaseResume = async (
  data: Omit<BaseResume, "id" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: BaseResume;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.message || "Failed to create base resume");
    }
  } catch (error) {
    console.error("Error creating base resume:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create base resume",
    };
  }
};

// Update base resume
export const updateBaseResume = async (
  id: string,
  data: Partial<Omit<BaseResume, "id" | "createdAt" | "updatedAt">>
): Promise<{
  success: boolean;
  data?: BaseResume;
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) {
      return { success: true, data: result.data };
    } else {
      throw new Error(result.message || "Failed to update base resume");
    }
  } catch (error) {
    console.error("Error updating base resume:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update base resume",
    };
  }
};

// ==================== AI Resume Generation API ====================
export const generateResume = async (
  request: ResumeGenerationRequest
): Promise<{
  success: boolean;
  data?: GeneratedResume;
  message?: string;
}> => {
  try {
    const response = await fetch(AI_GENERATE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to generate resume");
    }

    return result;
  } catch (error) {
    console.error("Error generating resume:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// AI Action Items Generation API
export const generateActionItems = async (
  request: ActionItemsRequest
): Promise<{
  success: boolean;
  data?: string[];
  message?: string;
}> => {
  try {
    const response = await fetch(AI_ACTION_ITEMS, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to generate action items");
    }

    return result;
  } catch (error) {
    console.error("Error generating action items:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// AI Status Check
export const getAIStatus = async (): Promise<{
  success: boolean;
  data?: {
    available: boolean;
    modelInfo?: any;
    message: string;
  };
  message?: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/status`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to check AI status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking AI status:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Get Generated Resumes
export const getGeneratedResumes = async (filters?: {
  jobApplicationId?: string;
  baseResumeId?: string;
}): Promise<{
  success: boolean;
  data?: GeneratedResume[];
  message?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (filters?.jobApplicationId)
      params.append("jobApplicationId", filters.jobApplicationId);
    if (filters?.baseResumeId)
      params.append("baseResumeId", filters.baseResumeId);

    const response = await fetch(
      `${API_BASE_URL}/api/ai/generated-resumes?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch generated resumes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching generated resumes:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Delete Generated Resume
export const deleteGeneratedResume = async (
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai/generated-resumes/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete generated resume");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting generated resume:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// ==================== Job Applications API ====================

// Get all job applications
export const getJobApplications = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: {
    data: JobApplication[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${JOB_APPLICATIONS_API}${
      params.toString() ? `?${params}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch job applications");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Get single job application
export const getJobApplication = async (
  id: string
): Promise<{
  success: boolean;
  data?: JobApplication;
  message?: string;
}> => {
  try {
    const response = await fetch(`${JOB_APPLICATIONS_API}/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch job application");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching job application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Create job application
export const createJobApplication = async (
  data: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: JobApplication;
  message?: string;
}> => {
  try {
    const response = await fetch(JOB_APPLICATIONS_API, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create job application");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating job application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Update job application
export const updateJobApplication = async (
  id: string,
  data: Partial<JobApplication>
): Promise<{
  success: boolean;
  data?: JobApplication;
  message?: string;
}> => {
  try {
    const response = await fetch(`${JOB_APPLICATIONS_API}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update job application");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating job application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Delete job application
export const deleteJobApplication = async (
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await fetch(`${JOB_APPLICATIONS_API}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete job application");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting job application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
