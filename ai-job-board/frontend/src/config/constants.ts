import {
  Mail,
  CalendarClock,
  Briefcase,
  FileText,
  XCircle,
} from "lucide-react";
import type { ApplicationStatusType, KanbanColumnSpec } from "@/types";

export const COLUMN_CONFIGS: KanbanColumnSpec[] = [
  {
    id: "APPLIED",
    title: "Applied",
    icon: Mail,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "INTERVIEW_SCHEDULED",
    title: "Interview Scheduled",
    icon: CalendarClock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "INTERVIEWING",
    title: "Interviewing",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "OFFER",
    title: "Offer",
    icon: FileText,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "REJECTED",
    title: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  JOB_APPLICATIONS: `${API_BASE_URL}/api/job-applications`,
  RESUMES: `${API_BASE_URL}/api/resumes`,
  AI_GENERATE: `${API_BASE_URL}/api/ai/generate-resume-db`,
  AI_ACTION_ITEMS: `${API_BASE_URL}/api/ai/action-items`,
  AI_STATUS: `${API_BASE_URL}/api/ai/status`,
} as const;

// Individual exports for easier importing
export const AI_GENERATE = API_ENDPOINTS.AI_GENERATE;
export const AI_ACTION_ITEMS = API_ENDPOINTS.AI_ACTION_ITEMS;
export const JOB_APPLICATIONS_API = API_ENDPOINTS.JOB_APPLICATIONS;
