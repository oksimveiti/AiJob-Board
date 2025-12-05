import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Users,
  MessageSquare,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { JobApplication, AIActionItem } from "@/types";
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
import {
  generateActionItems as generateAIActionItems,
  getAIStatus,
  testAPIConnectivity,
} from "@/services/api";

interface JobActionItemsProps {
  application: JobApplication;
}

// Parse AI-generated action items from text response
const parseAIActionItems = (aiResponse: string[]): AIActionItem[] => {
  const items: AIActionItem[] = [];

  aiResponse.forEach((response, index) => {
    // Parse action items with format: [PRIORITY] Title - Description (Time)
    const match = response.match(
      /^\[(high|medium|low)\]\s*(.+?)\s*-\s*(.+?)\s*\((\d+(?:\s*-\s*\d+)?)\s*minutes?\)$/i
    );

    if (match) {
      const [, priority, title, description, time] = match;
      items.push({
        id: `ai-${index}`,
        title: title.trim(),
        description: description.trim(),
        priority: priority.toLowerCase() as "high" | "medium" | "low",
        estimatedTime: `${time} minutes`,
      });
    } else if (response.trim()) {
      // Fallback for unformatted responses
      items.push({
        id: `ai-${index}`,
        title: `AI Recommendation ${index + 1}`,
        description: response.trim(),
        priority: "medium",
        estimatedTime: "30 minutes",
      });
    }
  });

  return items;
};

// Fallback action items when AI is not available
const getFallbackActionItems = (
  application: JobApplication
): AIActionItem[] => {
  const items: AIActionItem[] = [];

  switch (application.status) {
    case "OPENING":
      items.push(
        {
          id: "fallback-1",
          title: "Review job requirements",
          description:
            "Carefully review the job description and match your skills.",
          priority: "high",
          estimatedTime: "30 minutes",
        },
        {
          id: "fallback-2",
          title: "Research the company",
          description: "Learn about company culture and recent projects.",
          priority: "medium",
          estimatedTime: "45 minutes",
        }
      );
      break;
    case "APPLIED":
      items.push(
        {
          id: "fallback-1",
          title: "Follow up in 1 week",
          description: "Send a polite follow-up email after one week.",
          priority: "medium",
          estimatedTime: "15 minutes",
        },
        {
          id: "fallback-2",
          title: "Prepare for interviews",
          description: "Research common questions for this role.",
          priority: "high",
          estimatedTime: "60 minutes",
        }
      );
      break;
    default:
      items.push({
        id: "fallback-1",
        title: "Continue job search",
        description: "Keep applying to relevant positions and networking.",
        priority: "high",
        estimatedTime: "30 minutes",
      });
  }

  return items;
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="h-4 w-4" />;
    case "medium":
      return <Clock className="h-4 w-4" />;
    case "low":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function JobActionItems({ application }: JobActionItemsProps) {
  const [actionItems, setActionItems] = useState<AIActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(true);

  const loadActionItems = async (retry = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const isConnected = await testAPIConnectivity();
      if (!isConnected) {
        throw new Error("API connectivity test failed");
      }

      const statusResponse = await getAIStatus();

      if (!statusResponse.success || !statusResponse.data?.available) {
        const fallbackItems = getFallbackActionItems(application);
        setActionItems(fallbackItems);
        setIsAIEnabled(false);
      } else {
        const request = {
          jobApplicationId: application.id,
          jobDescription: application.jobDescription || "",
          companyInfo: `${application.companyName} - ${
            application.location || ""
          }`,
        };

        const response = await generateAIActionItems(request);

        if (response.success && response.data) {
          const parsedItems = parseAIActionItems(response.data);
          setActionItems(
            parsedItems.length > 0
              ? parsedItems
              : getFallbackActionItems(application)
          );
        } else {
          throw new Error(
            response.message || "Failed to generate action items"
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load action items"
      );
      const fallbackItems = getFallbackActionItems(application);
      setActionItems(fallbackItems);
      setIsAIEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActionItems();
  }, [application]);

  const handleRefresh = () => {
    loadActionItems(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI-Powered Action Items
          </CardTitle>
          <CardDescription>
            Generating personalized recommendations...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !isAIEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Action Items
          </CardTitle>
          <CardDescription>
            Using general recommendations (AI unavailable)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sm font-medium">{item.title}</div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isAIEnabled ? (
                <Zap className="h-5 w-5 text-yellow-500" />
              ) : (
                <Target className="h-5 w-5 text-blue-500" />
              )}
              {isAIEnabled ? "AI-Powered Action Items" : "Action Items"}
            </CardTitle>
            <CardDescription>
              {isAIEnabled
                ? "Personalized recommendations for your job application"
                : "General recommendations for this application stage"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {actionItems.length > 0 ? (
              actionItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          <span className="flex items-center gap-1">
                            {getPriorityIcon(item.priority)}
                            {item.priority}
                          </span>
                        </Badge>
                        <div className="text-sm font-medium">{item.title}</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{item.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No action items available for this status.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
