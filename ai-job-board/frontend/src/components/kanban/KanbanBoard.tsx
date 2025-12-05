"use client";

import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  Search,
  Mail,
  CalendarClock,
  Briefcase,
  FileText,
  XCircle,
  UserCircle,
  Sparkles,
} from "lucide-react";
import type {
  JobApplication,
  ApplicationStatusType,
  BaseResume,
} from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { AddJobApplicationForm } from "./AddJobApplicationForm";
import { JobActionItems } from "./JobActionItems";
import { SimpleResumeManager } from "./SimpleResumeManager";
import { AIResumeGenerator } from "./AIResumeGenerator";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/Loading";
import { useToast } from "@/components/ToastProvider";
import {
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getBaseResume,
  createBaseResume,
  updateBaseResume,
} from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Configuration extracted from reference
const COLUMN_CONFIGS = [
  { id: "OPENING" as ApplicationStatusType, title: "Opening", icon: Search },
  { id: "APPLIED" as ApplicationStatusType, title: "Applied", icon: Mail },
  {
    id: "INTERVIEW_SCHEDULED" as ApplicationStatusType,
    title: "Interview Scheduled",
    icon: CalendarClock,
  },
  {
    id: "INTERVIEWING" as ApplicationStatusType,
    title: "Interviewing",
    icon: Briefcase,
  },
  { id: "OFFER" as ApplicationStatusType, title: "Offer", icon: FileText },
  { id: "REJECTED" as ApplicationStatusType, title: "Rejected", icon: XCircle },
];

export function KanbanBoard() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);
  const [isActionItemDialogOpen, setIsActionItemDialogOpen] = useState(false);
  const [isResumeManagerOpen, setIsResumeManagerOpen] = useState(false);
  const [isAIResumeGeneratorOpen, setIsAIResumeGeneratorOpen] = useState(false);
  const [selectedApplicationForAI, setSelectedApplicationForAI] =
    useState<JobApplication | null>(null);
  const [baseResume, setBaseResume] = useState<BaseResume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // TODO: add pagination or infinite scroll for better performance
    async function loadJobApplications() {
      setIsLoading(true);
      try {
        const response = await getJobApplications();
        if (response.success && response.data) {
          const apps = response.data.data.map((app) => ({
            ...app,
            applicationDate: new Date(app.applicationDate),
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt),
          }));
          setJobApplications(apps);
        } else {
          throw new Error(response.message || "Failed to load applications");
        }
      } catch (error) {
        // TODO: implement retry logic
        toast.error(
          "Error",
          "Failed to load job applications. Please refresh the page."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadJobApplications();

    async function loadBaseResume() {
      try {
        const response = await getBaseResume();
        if (response.success && response.data) {
          setBaseResume({
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
          });
        }
      } catch (error) {
        // Silently fail if no base resume exists
      }
    }

    loadBaseResume();
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    applicationId: string
  ) => {
    e.dataTransfer.setData("applicationId", applicationId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetStatus: ApplicationStatusType
  ) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData("applicationId");
    const app = jobApplications.find((a) => a.id === applicationId);

    if (!app) return;

    // Optimistic update
    setJobApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === applicationId
          ? { ...app, status: targetStatus, updatedAt: new Date() }
          : app
      )
    );

    try {
      const response = await updateJobApplication(applicationId, {
        status: targetStatus,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to update status");
      }
      toast.success("Updated", `Moved to ${targetStatus.replace("_", " ")}`);
    } catch (error) {
      toast.error("Error", "Failed to update application status");
      setJobApplications((prevApps) =>
        prevApps.map((a) =>
          a.id === applicationId ? { ...a, status: app.status } : a
        )
      );
    }
  };

  const handleSaveApplication = async (
    formData: Omit<JobApplication, "id" | "status" | "createdAt" | "updatedAt">
  ) => {
    if (editingApplication) {
      try {
        const response = await updateJobApplication(
          editingApplication.id,
          formData
        );
        if (response.success && response.data) {
          setJobApplications((prevApps) =>
            prevApps.map((app) =>
              app.id === editingApplication.id
                ? {
                    ...response.data,
                    applicationDate: new Date(response.data.applicationDate),
                    createdAt: new Date(response.data.createdAt),
                    updatedAt: new Date(response.data.updatedAt),
                  }
                : app
            )
          );
          toast.success("Updated", "Application updated successfully");
        } else {
          throw new Error(response.message || "Failed to update");
        }
      } catch (error) {
        toast.error("Error", "Failed to update application");
        return;
      }
      setEditingApplication(null);
    } else {
      try {
        const response = await createJobApplication({
          ...formData,
          status: "OPENING",
        });
        if (response.success && response.data) {
          const newApp = {
            ...response.data,
            applicationDate: new Date(response.data.applicationDate),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
          };
          setJobApplications((prevApps) => [...prevApps, newApp]);
          toast.success("Created", "Application created successfully");
        } else {
          throw new Error(response.message || "Failed to create");
        }
      } catch (error) {
        toast.error("Error", "Failed to create application");
        return;
      }
    }
    setIsFormOpen(false);
  };

  const handleOpenAddForm = () => {
    setEditingApplication(null);
    setIsFormOpen(true);
  };

  const handleCardClick = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsActionItemDialogOpen(true);
  };

  const handleCardEditClick = (application: JobApplication) => {
    setEditingApplication(application);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-headline text-primary">
            Loading JobTrack Board...
          </h1>
        </div>
        <div className="flex-grow flex gap-4 overflow-x-auto pb-4">
          {COLUMN_CONFIGS.map((spec) => (
            <Card
              key={spec.id}
              className="min-w-[300px] w-[300px] h-full flex flex-col bg-muted/50 rounded-lg shadow-sm"
            >
              <CardHeader className="p-4 border-b border-border sticky top-0 bg-muted/50 z-10 rounded-t-lg">
                <CardTitle className="font-headline text-lg flex items-center">
                  <spec.icon className="h-5 w-5 mr-2 text-primary" />
                  {spec.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-y-auto">
                <div className="space-y-2">
                  <div className="h-24 bg-background rounded animate-pulse"></div>
                  <div className="h-24 bg-background rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleResumeSave = async (resume: BaseResume) => {
    try {
      if (resume.id && baseResume?.id) {
        const response = await updateBaseResume(resume.id, {
          name: resume.name,
          content: resume.content,
        });
        if (response.success && response.data) {
          setBaseResume({
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
          });
          toast.success("Updated", "Resume updated successfully");
        } else {
          throw new Error(response.message || "Failed to update resume");
        }
      } else {
        const response = await createBaseResume({
          name: resume.name,
          content: resume.content,
          userId: "demo-user",
        });
        if (response.success && response.data) {
          setBaseResume({
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
          });
          toast.success("Created", "Resume saved successfully");
        } else {
          throw new Error(response.message || "Failed to create resume");
        }
      }
      setIsResumeManagerOpen(false);
    } catch (error) {
      toast.error("Error", "Failed to save resume");
    }
  };

  const handleModifyResume = (application: JobApplication) => {
    setSelectedApplicationForAI(application);
    setIsAIResumeGeneratorOpen(true);
  };

  const handleResumeGenerated = (generatedResume: any) => {
    toast.success("Success", "AI resume generated and saved successfully");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-6"
      style={{ minHeight: "100vh" }}
    >
      <header className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              AiJob Board
            </h1>
            <p className="text-gray-600 mt-2">
              Track your job search journey with AI-powered insights and resume
              customization
            </p>
          </div>
          <div className="flex items-center gap-3">
            {baseResume && (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 cursor-default"
              >
                <FileText className="h-3 w-3 mr-1" />
                Resume Ready
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => setIsResumeManagerOpen(true)}
            >
              <UserCircle className="mr-2 h-5 w-5" />
              {baseResume ? "Manage Resume" : "Upload Resume"}
            </Button>
            <Dialog
              open={isFormOpen}
              onOpenChange={(isOpen) => {
                setIsFormOpen(isOpen);
                if (!isOpen) {
                  setEditingApplication(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddForm}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Opening
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">
                    {editingApplication
                      ? "Edit Job Opening"
                      : "Add New Job Opening"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingApplication
                      ? "Update the details for this job opening."
                      : "Fill in the details for this job opening. You can move it to 'Applied' when ready to submit."}
                  </DialogDescription>
                </DialogHeader>
                <AddJobApplicationForm
                  onSave={handleSaveApplication}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingApplication(null);
                  }}
                  initialData={editingApplication}
                  mode={editingApplication ? "edit" : "add"}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Resume Manager Dialog */}
      <Dialog open={isResumeManagerOpen} onOpenChange={setIsResumeManagerOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
              Resume Manager
            </DialogTitle>
            <DialogDescription>
              Upload and manage your base resume. This will be used for
              AI-powered customization when you click "Modify Resume" on any job
              opening.
            </DialogDescription>
          </DialogHeader>
          <SimpleResumeManager
            initialResume={baseResume}
            onResumeSave={handleResumeSave}
          />
        </DialogContent>
      </Dialog>

      {/* AI Resume Generator Dialog */}
      <Dialog
        open={isAIResumeGeneratorOpen}
        onOpenChange={(open) => {
          setIsAIResumeGeneratorOpen(open);
          if (!open) {
            setSelectedApplicationForAI(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Resume Generator</DialogTitle>
            <DialogDescription>
              Generate a customized resume tailored to this specific job opening
              using AI.
            </DialogDescription>
          </DialogHeader>
          {selectedApplicationForAI && (
            <AIResumeGenerator
              application={selectedApplicationForAI}
              baseResume={baseResume}
              onClose={() => {
                setIsAIResumeGeneratorOpen(false);
                setSelectedApplicationForAI(null);
              }}
              onResumeGenerated={handleResumeGenerated}
            />
          )}
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-grow w-full">
        <div className="flex gap-4 pb-4 h-[calc(100vh-150px)] sm:h-[calc(100vh-120px)]">
          {COLUMN_CONFIGS.map((spec) => (
            <KanbanColumn
              key={spec.id}
              columnSpec={spec}
              applications={jobApplications.filter(
                (app) => app.status === spec.id
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onCardDragStart={handleDragStart}
              onCardClick={handleCardClick}
              onCardEdit={handleCardEditClick}
              onModifyResume={handleModifyResume}
              hasBaseResume={!!baseResume}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedApplication && (
        <Dialog
          open={isActionItemDialogOpen}
          onOpenChange={setIsActionItemDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl text-primary flex items-center">
                <Info size={20} className="mr-2" />
                Application Details & Suggestions
              </DialogTitle>
              <DialogDescription>
                Review details for {selectedApplication.jobTitle} at{" "}
                {selectedApplication.companyName} and see AI-powered action
                items.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    {selectedApplication.jobTitle}
                  </CardTitle>
                  <CardDescription>
                    {selectedApplication.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedApplication.status.replace("_", " ")}
                  </p>
                  <p>
                    <strong>Applied Date:</strong>{" "}
                    {format(selectedApplication.applicationDate, "PPP")}
                  </p>
                  {selectedApplication.location && (
                    <p>
                      <strong>Location:</strong> {selectedApplication.location}
                    </p>
                  )}
                  {selectedApplication.salary && (
                    <p>
                      <strong>Salary:</strong> {selectedApplication.salary}
                    </p>
                  )}
                  {selectedApplication.jobPostingLink && (
                    <p>
                      <strong>Job Link:</strong>{" "}
                      <a
                        href={selectedApplication.jobPostingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        View Posting <ExternalLink size={14} className="ml-1" />
                      </a>
                    </p>
                  )}
                  {selectedApplication.notes && (
                    <p>
                      <strong>Notes:</strong> {selectedApplication.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
              <JobActionItems application={selectedApplication} />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setIsActionItemDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
