/**
 * Resume Parser Service (Client-side)
 * 
 * This service handles resume parsing by sending files to the server-side API
 * which performs the actual PDF/DOCX text extraction and parsing.
 */

import { ResumeProfile } from '@/lib/resume-schema';

// Parser result interface
interface ParseResult {
  success: boolean;
  profile?: ResumeProfile;
  confidence: number;
  errors?: string[];
  warnings?: string[];
}

export class ResumeParser {
  /**
   * Main parsing function - sends file to server-side API
   */
  async parseResume(file: File): Promise<ParseResult> {
    try {
      // Validate file
      if (!file) {
        return {
          success: false,
          confidence: 0,
          errors: ['No file provided']
        };
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          confidence: 0,
          errors: ['File size exceeds 10MB limit']
        };
      }

      // Check file type
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!supportedTypes.includes(file.type)) {
        return {
          success: false,
          confidence: 0,
          errors: ['Unsupported file type. Please upload PDF or DOCX files.']
        };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Send to server-side API
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          confidence: 0,
          errors: [errorData.error || 'Failed to parse resume']
        };
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          confidence: 0,
          errors: [result.error || 'Parsing failed']
        };
      }

      return {
        success: true,
        profile: result.profile,
        confidence: result.confidence || 0.8,
        warnings: ['Please review the extracted information for accuracy']
      };

    } catch (error) {
      console.error('Resume parsing error:', error);
      return {
        success: false,
        confidence: 0,
        errors: [`Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

// Export singleton instance
export const resumeParser = new ResumeParser();
