import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { JobApplication, BaseResume, GeneratedResume } from "@/types";
import { generateResume, getGeneratedResumes } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIResumeGeneratorProps {
  application: JobApplication;
  baseResume: BaseResume | null;
  onClose: () => void;
  onResumeGenerated?: (resume: GeneratedResume) => void;
}

export function AIResumeGenerator({
  application,
  baseResume,
  onClose,
  onResumeGenerated,
}: AIResumeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedResume, setGeneratedResume] =
    useState<GeneratedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customRequirements, setCustomRequirements] = useState("");

  useEffect(() => {
    async function loadExistingResume() {
      if (!baseResume) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getGeneratedResumes({
          jobApplicationId: application.id,
          baseResumeId: baseResume.id,
        });

        if (response.success && response.data && response.data.length > 0) {
          const latestResume = response.data[0];
          setGeneratedResume(latestResume);
        }
      } catch (error) {
        // Silently fail - no existing resume
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingResume();
  }, [application.id, baseResume]);

  const handleGenerate = async (forceRegenerate = false) => {
    if (!baseResume) {
      setError(
        "Please upload a base resume first before generating an AI-customized version."
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request = {
        jobApplicationId: application.id,
        baseResumeId: baseResume.id,
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        location: application.location,
        salary: application.salary,
        jobDescription: application.jobDescription || "",
        customRequirements: customRequirements.trim() || undefined,
        baseResumeContent: baseResume.content,
        forceRegenerate,
      };

      const response = await generateResume(request);

      if (response.success && response.data) {
        setGeneratedResume(response.data);
        onResumeGenerated?.(response.data);
      } else {
        throw new Error(response.message || "Failed to generate resume");
      }
    } catch (err) {
      // TODO: better error messages for different failure types
      setError(
        err instanceof Error ? err.message : "Failed to generate resume"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResume) return;
    // TODO: support multiple formats (PDF, DOCX)
    const blob = new Blob([generatedResume.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${application.companyName.replace(/\s+/g, "_")}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedResume) return;

    try {
      await navigator.clipboard.writeText(generatedResume.content);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading existing resume...</span>
        </div>
      )}

      {/* Content (only show when not loading) */}
      {!isLoading && (
        <>
          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">AI Resume Generator</h3>
            <p className="text-gray-600 text-sm">
              Customize your resume for {application.jobTitle} at{" "}
              {application.companyName}
            </p>
          </div>

          {/* Job Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
              <CardDescription>{application.companyName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {application.location && (
                <p>
                  <strong>Location:</strong> {application.location}
                </p>
              )}
              {application.salary && (
                <p>
                  <strong>Salary:</strong> {application.salary}
                </p>
              )}
              {application.jobPostingLink && (
                <p>
                  <strong>Job Link:</strong>{" "}
                  <a
                    href={application.jobPostingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center ml-1"
                  >
                    View Posting <ExternalLink size={12} className="ml-1" />
                  </a>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Base Resume Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Base Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {baseResume ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      {baseResume.fileName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {baseResume.fileType}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Uploaded{" "}
                    {new Date(baseResume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No base resume found. Please upload a base resume first to
                    generate AI-customized versions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Custom Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Custom Requirements (Optional)
              </CardTitle>
              <CardDescription>
                Add any specific requirements or focus areas for this
                application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                placeholder="e.g., Emphasize leadership experience, highlight Python skills, focus on project management..."
                className="w-full h-20 p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          {!generatedResume && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !baseResume}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Resume
                </>
              )}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generated Resume Display */}
          {generatedResume && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Generated Resume</CardTitle>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 hover:bg-green-100 cursor-default"
                  >
                    AI Generated
                  </Badge>
                </div>
                <CardDescription>
                  Resume customized for {application.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleDownload} size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleCopyToClipboard}
                    size="sm"
                    variant="outline"
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={() => handleGenerate(true)}
                    size="sm"
                    variant="outline"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Regenerate
                  </Button>
                </div>

                {/* Resume Content */}
                <div className="border rounded-lg">
                  <ScrollArea className="h-[400px] w-full">
                    <div className="p-4 text-sm whitespace-pre-wrap font-mono">
                      {generatedResume.content}
                    </div>
                  </ScrollArea>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Generated:</strong>{" "}
                    {new Date(generatedResume.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Model:</strong>{" "}
                    {generatedResume.modelInfo?.name || "Local LLM"}
                  </p>
                  <p>
                    <strong>Processing Time:</strong>{" "}
                    {generatedResume.processingTime}ms
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              {generatedResume ? "Done" : "Cancel"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
