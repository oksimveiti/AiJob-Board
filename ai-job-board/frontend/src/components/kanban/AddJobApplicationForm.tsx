import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { JobApplication, ApplicationFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  applicationDate: z.string().min(1, "Application date is required"),
  location: z.string().optional(),
  jobPostingLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddJobApplicationFormProps {
  onSave: (
    data: Omit<JobApplication, "id" | "status" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  initialData?: JobApplication | null;
  mode: "add" | "edit";
}

export function AddJobApplicationForm({
  onSave,
  onCancel,
  initialData,
  mode,
}: AddJobApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          jobTitle: initialData.jobTitle,
          applicationDate: initialData.applicationDate
            .toISOString()
            .split("T")[0], // Format as YYYY-MM-DD
          location: initialData.location || "",
          jobPostingLink: initialData.jobPostingLink || "",
          salary: initialData.salary || "",
          notes: initialData.notes || "",
        }
      : {
          companyName: "",
          jobTitle: "",
          applicationDate: new Date().toISOString().split("T")[0], // Today's date
          location: "",
          jobPostingLink: "",
          salary: "",
          notes: "",
        },
  });

  const onSubmit = (data: FormData) => {
    const jobApplicationData = {
      ...data,
      applicationDate: new Date(data.applicationDate), // Convert string to Date
      location: data.location || undefined,
      jobPostingLink: data.jobPostingLink || undefined,
      salary: data.salary || undefined,
      notes: data.notes || undefined,
    };

    onSave(jobApplicationData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="e.g., Google, Microsoft, StartupXYZ"
            {...register("companyName")}
            className={errors.companyName ? "border-red-500" : ""}
          />
          {errors.companyName && (
            <p className="text-sm text-red-500">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            placeholder="e.g., Senior Frontend Developer, UX Designer, Data Scientist"
            {...register("jobTitle")}
            className={errors.jobTitle ? "border-red-500" : ""}
          />
          {errors.jobTitle && (
            <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="applicationDate">Discovery Date *</Label>
          <Input
            id="applicationDate"
            type="date"
            {...register("applicationDate")}
            className={errors.applicationDate ? "border-red-500" : ""}
          />
          {errors.applicationDate && (
            <p className="text-sm text-red-500">
              {errors.applicationDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Remote, New York, NY, San Francisco, CA"
            {...register("location")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="jobPostingLink">Job Posting Link</Label>
          <Input
            id="jobPostingLink"
            type="url"
            placeholder="https://example.com/job-posting"
            {...register("jobPostingLink")}
            className={errors.jobPostingLink ? "border-red-500" : ""}
          />
          {errors.jobPostingLink && (
            <p className="text-sm text-red-500">
              {errors.jobPostingLink.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            placeholder="e.g., $80k - $100k, $75,000, Competitive"
            {...register("salary")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this application... (e.g., contacted by recruiter, follow-up required, etc.)"
          rows={4}
          {...register("notes")}
        />
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-amber-800">
            Opening Discovery Tip
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-amber-700">
            Track job openings you discover during your search. Include notes
            about why this role interests you, key requirements you notice, or
            any connections you have at the company. Move to "Applied" when
            you're ready to submit your application.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
            ? "Update Opening"
            : "Add Opening"}
        </Button>
      </div>
    </form>
  );
}
