'use client';

import { Summary } from '@/lib/resume-schema';
import { UnifiedTextarea } from '@/components/fields';

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
      <UnifiedTextarea
        id="summary-content"
        section="summary"
        fieldKey="content"
        label="Professional Summary"
        value={summary?.content || ''}
        onChange={updateContent}
        placeholder="Write a compelling professional summary that highlights your key skills and experience..."
        rows={5}
        helpText="2-3 sentences that summarize your professional background and career goals."
      />
    </div>
  );
}
