import React, { useState } from 'react';
import type { JobApplication as JobApplicationType, KanbanColumnSpec as KanbanColumnSpecType } from '@/types';
import { KanbanCard } from './KanbanCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  columnSpec: KanbanColumnSpecType;
  applications: JobApplicationType[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => void;
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, applicationId: string) => void;
  onCardClick: (application: JobApplicationType) => void;
  onCardEdit: (application: JobApplicationType) => void;
  onModifyResume?: (application: JobApplicationType) => void;
  hasBaseResume?: boolean;
}

export function KanbanColumn({
  columnSpec,
  applications,
  onDragOver,
  onDrop,
  onCardDragStart,
  onCardClick,
  onCardEdit,
  onModifyResume,
  hasBaseResume,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, columnSpec.id);
  };

  const getVariantColor = (status: string) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'OPENING': 'outline',
      'APPLIED': 'default',
      'INTERVIEW_SCHEDULED': 'secondary',
      'INTERVIEWING': 'outline',
      'OFFER': 'default',
      'REJECTED': 'destructive',
    };
    return colorMap[status] || 'default';
  };

  return (
    <Card className={`min-w-[300px] w-[300px] h-full flex flex-col bg-gray-50 border-gray-200 transition-all duration-200 ${
      isDragOver ? 'bg-blue-50 border-blue-300' : ''
    }`}>
      <CardHeader className="p-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center text-gray-900">
            <columnSpec.icon className="h-5 w-5 mr-2 text-gray-700" />
            {columnSpec.title}
          </CardTitle>
          <Badge
            variant={getVariantColor(columnSpec.id)}
            className="text-xs font-semibold"
          >
            {applications.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        className={`p-4 flex-grow overflow-y-auto transition-colors duration-200 ${
          isDragOver ? 'bg-blue-100/50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-3 min-h-[200px]">
          {applications.length === 0 ? (
            <div className={`text-center py-8 text-sm transition-colors duration-200 ${
              isDragOver ? 'text-blue-600' : 'text-gray-500'
            }`}>
              <columnSpec.icon className={`h-12 w-12 mx-auto mb-3 transition-colors duration-200 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <p className={`font-medium ${isDragOver ? 'text-blue-700' : 'text-gray-600'}`}>
                {isDragOver ? 'Drop application here' : 'No applications yet'}
              </p>
              <p className="text-xs mt-1 opacity-75">
                {isDragOver ? 'Release to add to this column' : 'Drag cards here'}
              </p>
            </div>
          ) : (
            applications.map((application) => (
              <KanbanCard
                key={application.id}
                application={application}
                onDragStart={onCardDragStart}
                onClick={onCardClick}
                onEdit={onCardEdit}
                onModifyResume={onModifyResume}
                hasBaseResume={hasBaseResume}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}