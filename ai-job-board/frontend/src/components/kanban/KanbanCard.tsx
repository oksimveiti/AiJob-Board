import React from 'react';
import { format, parseISO } from 'date-fns';
import { ExternalLink, Edit2, MapPin, DollarSign, Calendar, FileText, Sparkles } from 'lucide-react';
import type { JobApplication as JobApplicationType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface KanbanCardProps {
  application: JobApplicationType;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicationId: string) => void;
  onClick: (application: JobApplicationType) => void;
  onEdit: (application: JobApplicationType) => void;
  onModifyResume?: (application: JobApplicationType) => void;
  hasBaseResume?: boolean;
}

export function KanbanCard({ application, onDragStart, onClick, onEdit, onModifyResume, hasBaseResume }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    onDragStart(e, application.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleCardClick = () => {
    onClick(application);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(application);
  };

  const handleModifyResumeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onModifyResume?.(application);
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 truncate font-heading">
              {application.jobTitle}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-gray-700 truncate">
              {application.companyName}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {onModifyResume && hasBaseResume && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModifyResumeClick}
                className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                title="AI Modify Resume"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              title="Edit Opening"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {application.status === 'OPENING' ? 'Discovered' : 'Applied'}: {
            application.applicationDate && application.applicationDate !== 'Invalid Date'
              ? format(new Date(application.applicationDate), 'MMM d, yyyy')
              : 'No date'
          }
        </div>

        {application.location && (
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {application.location}
          </div>
        )}

        {application.salary && (
          <div className="flex items-center text-xs text-gray-500">
            <DollarSign className="h-3 w-3 mr-1" />
            {application.salary}
          </div>
        )}

        {application.jobPostingLink && (
          <div className="pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(application.jobPostingLink, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Posting
            </Button>
          </div>
        )}

        {application.notes && (
          <div className="pt-1">
            <p className="text-xs text-gray-600 line-clamp-2 italic">
              "{application.notes}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}