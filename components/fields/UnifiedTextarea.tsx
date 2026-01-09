'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedFieldProps, generateFieldId } from '@/lib/fields/field-types';

interface TextareaFieldProps extends UnifiedFieldProps {
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

export function UnifiedTextarea({
  id,
  section,
  fieldKey,
  itemId,
  itemIndex,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  highlighted,
  suggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
  error,
  helpText,
  className,
  rows = 4,
  maxLength,
  showCharCount = false,
}: TextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Generate consistent element ID
  const elementId = id || generateFieldId(section, fieldKey, itemId, itemIndex);
  
  // Handle highlight effect
  useEffect(() => {
    if (highlighted) {
      setIsHighlighted(true);
      
      // Scroll into view
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textareaRef.current?.focus();
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlighted]);

  const handleAcceptSuggestion = () => {
    if (suggestion && onAcceptSuggestion) {
      // Replace the original text with the suggestion
      const newValue = value.replace(
        new RegExp(suggestion.original, 'gi'),
        suggestion.replacement
      );
      onChange(newValue);
      onAcceptSuggestion(suggestion);
    }
  };

  const handleDismissSuggestion = () => {
    if (suggestion && onDismissSuggestion) {
      onDismissSuggestion(suggestion);
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={elementId}
          className={cn(
            'text-sm font-medium',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
        
        {showCharCount && maxLength && (
          <span className={cn(
            'text-xs',
            value.length > maxLength ? 'text-red-500' : 'text-slate-400'
          )}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id={elementId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'transition-all duration-200 resize-none',
            isHighlighted && 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50',
            error && 'border-red-500 focus:ring-red-500',
            suggestion && 'border-blue-400 bg-blue-50/50'
          )}
        />
        
        {/* Inline suggestion indicator */}
        {suggestion && (
          <div className="absolute right-2 top-2 flex items-center gap-1 bg-white/90 rounded px-1">
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded max-w-[150px] truncate">
              {suggestion.message || `"${suggestion.original}" → "${suggestion.replacement}"`}
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={handleAcceptSuggestion}
              title="Accept suggestion"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              onClick={handleDismissSuggestion}
              title="Dismiss suggestion"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {/* Help text */}
      {helpText && !error && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}
