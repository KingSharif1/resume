'use client';

import { useState, useEffect } from 'react';
import { validateSection } from '@/lib/section-validator';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface SectionValidationProps {
  sectionType: string;
  content: string;
}

export function SectionValidation({ sectionType, content }: SectionValidationProps) {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
    suggestions?: string[];
  } | null>(null);

  useEffect(() => {
    // Only validate if there's content
    if (content.trim()) {
      const result = validateSection(sectionType, content);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [sectionType, content]);

  if (!validationResult) {
    return null;
  }

  return (
    <div className="mt-2">
      <Alert variant={validationResult.isValid ? "default" : "destructive"} className="bg-opacity-50">
        <div className="flex items-start gap-2">
          {validationResult.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          )}
          <div>
            <AlertTitle className="text-sm font-medium">
              {validationResult.isValid ? 'Looks Good!' : 'Suggestions'}
            </AlertTitle>
            {validationResult.message && (
              <AlertDescription className="text-xs mt-1">
                {validationResult.message}
              </AlertDescription>
            )}
            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <ul className="text-xs mt-2 space-y-1 list-disc pl-4">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
