import React from 'react';
import { TailoredResume } from '@/types/resume';
import { ModernTemplate } from './pdf-templates/ModernTemplate';
import { ClassicTemplate } from './pdf-templates/ClassicTemplate';
import { MinimalTemplate } from './pdf-templates/MinimalTemplate';

interface ResumePDFProps {
  resume: TailoredResume;
  template?: 'modern' | 'classic' | 'minimal';
}

export const ResumePDF: React.FC<ResumePDFProps> = ({ resume, template = 'modern' }) => {
  switch (template) {
    case 'classic':
      return <ClassicTemplate resume={resume} />;
    case 'minimal':
      return <MinimalTemplate resume={resume} />;
    case 'modern':
    default:
      return <ModernTemplate resume={resume} />;
  }
};
