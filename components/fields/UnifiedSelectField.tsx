'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { UnifiedSelectFieldProps, generateFieldId } from '@/lib/fields/field-types';

export function UnifiedSelectField({
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
  options,
}: UnifiedSelectFieldProps) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Generate consistent element ID
  const elementId = id || generateFieldId(section, fieldKey, itemId, itemIndex);
  
  // Handle highlight effect
  useEffect(() => {
    if (highlighted) {
      setIsHighlighted(true);
      
      // Scroll into view
      selectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      selectRef.current?.focus();
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlighted]);

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
      
      <select
        ref={selectRef}
        id={elementId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isHighlighted && 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50',
          error && 'border-red-500 focus:ring-red-500'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
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
