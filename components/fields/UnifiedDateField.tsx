'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UnifiedFieldProps, generateFieldId } from '@/lib/fields/field-types';

interface DateFieldProps extends Omit<UnifiedFieldProps, 'suggestion' | 'onAcceptSuggestion' | 'onDismissSuggestion'> {
  format?: 'YYYY-MM' | 'YYYY-MM-DD' | 'MM/YYYY';
}

export function UnifiedDateField({
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
  error,
  helpText,
  className,
  format = 'YYYY-MM',
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Generate consistent element ID
  const elementId = id || generateFieldId(section, fieldKey, itemId, itemIndex);
  
  // Handle highlight effect
  useEffect(() => {
    if (highlighted) {
      setIsHighlighted(true);
      
      // Scroll into view
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current?.focus();
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlighted]);

  // Determine input type based on format
  const inputType = format === 'YYYY-MM' ? 'month' : 'date';

  return (
    <div className={cn('space-y-1', className)}>
      <Label 
        htmlFor={elementId}
        className={cn(
          'text-sm font-medium',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </Label>
      
      <Input
        ref={inputRef}
        id={elementId}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'transition-all duration-200',
          isHighlighted && 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50',
          error && 'border-red-500 focus:ring-red-500'
        )}
      />
      
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
