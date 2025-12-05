import React, { useState } from 'react';
import { FileText, Upload, Eye, Save } from 'lucide-react';
import type { BaseResume } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimpleResumeManagerProps {
  initialResume?: BaseResume | null;
  onResumeSave: (resume: BaseResume) => void;
}

const generateId = () => crypto.randomUUID();

export function SimpleResumeManager({ initialResume, onResumeSave }: SimpleResumeManagerProps) {
  const [name, setName] = useState(initialResume?.name || '');
  const [content, setContent] = useState(initialResume?.content || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        if (!name.trim()) {
          // Extract first line as name if name is empty
          const firstLine = text.split('\n')[0].trim();
          if (firstLine && firstLine.length < 50) {
            setName(firstLine);
          } else {
            setName(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    if (name.trim() && content.trim()) {
      const resume: BaseResume = {
        id: initialResume?.id || generateId(),
        name: name.trim(),
        content: content.trim(),
        createdAt: initialResume?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      onResumeSave(resume);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Base Resume Setup
            </CardTitle>
            <CardDescription>
              Upload your base resume. This will be used by AI to create customized versions for each job application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume Name</Label>
              <Input
                id="resumeName"
                placeholder="e.g., Software Engineer Resume"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Resume File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a text file (.txt) or paste your resume content below
                </p>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeContent">Resume Content</Label>
              <Textarea
                id="resumeContent"
                placeholder="Paste your complete resume content here in plain text format. Include sections like:
• Contact Information
• Summary/Objective
• Experience
• Education
• Skills
• Certifications
• Projects"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500">
                Tip: Use clear section headers and bullet points for best AI customization results.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!content.trim()}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Resume Preview: {name || 'Untitled'}</h3>
              <Button
                variant="ghost"
                onClick={() => setIsPreviewOpen(false)}
              >
                ×
              </Button>
            </div>
            <ScrollArea className="max-h-[60vh] border rounded p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {content}
              </pre>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
}