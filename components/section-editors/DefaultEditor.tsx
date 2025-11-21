'use client';

import { BasicEditor } from '@/components/BasicEditor';
import { SectionValidation } from '@/components/SectionValidation';

interface DefaultEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
  sectionType?: string;
}

export function DefaultEditor({ 
  initialValue, 
  onChange,
  sectionType = 'custom'
}: DefaultEditorProps) {
  return (
    <div className="space-y-2">
      <BasicEditor
        content={initialValue}
        onChange={onChange}
        placeholder="Enter section content..."
        rows={8}
      />
      <SectionValidation 
        sectionType={sectionType} 
        content={initialValue} 
      />
    </div>
  );
}
