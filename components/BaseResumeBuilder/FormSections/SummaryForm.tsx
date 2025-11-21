'use client';

import { Summary } from '@/lib/resume-schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SummaryFormProps {
  summary?: Summary;
  onChange: (summary: Summary) => void;
}

export function SummaryForm({ summary, onChange }: SummaryFormProps) {
  const updateContent = (content: string) => {
    onChange({ content });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          value={summary?.content || ''}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Write a compelling professional summary that highlights your key skills and experience..."
          className="mt-1 min-h-[120px]"
        />
        <p className="text-sm text-slate-500 mt-2">
          2-3 sentences that summarize your professional background and career goals.
        </p>
      </div>
    </div>
  );
}
