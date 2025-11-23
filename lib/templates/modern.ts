import { ResumeProfile } from '@/lib/resume-schema';

export interface TemplateStyles {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  primaryColor: string;
  secondaryColor: string;
  headings: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    textTransform: string;
    borderBottom: string;
  };
}

export const modernTemplate: TemplateStyles = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '10pt',
  lineHeight: '1.5',
  primaryColor: '#000000',
  secondaryColor: '#666666',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14pt',
    fontWeight: '700',
    textTransform: 'uppercase',
    borderBottom: '1px solid #000000',
  },
};

export const generateModernHTML = (profile: ResumeProfile) => {
  // This function will generate the HTML structure for the resume
  // We will use this for the preview and PDF generation
  // For now, we are just defining the styles
  return '';
};
