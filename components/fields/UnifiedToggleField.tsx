'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { UnifiedToggleFieldProps, generateFieldId } from '@/lib/fields/field-types';

export function UnifiedToggleField({
  id,
  section,
  fieldKey,
  itemId,
  itemIndex,
  label,
  value,
  onChange,
  disabled,
  highlighted,
  error,
  helpText,
  className,
}: UnifiedToggleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // Generate consistent element ID
  const elementId = id || generateFieldId(section, fieldKey, itemId, itemIndex);
  
  // Handle highlight effect
  useEffect(() => {
    if (highlighted) {
      setIsHighlighted(true);
      
      // Scroll into view
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setIsHighlighted(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlighted]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex items-center justify-between p-2 rounded-md transition-all duration-200',
        isHighlighted && 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50',
        className
      )}
    >
      <Label 
        htmlFor={elementId}
        className="text-sm font-medium cursor-pointer"
      >
        {label}
      </Label>
      
      <Switch
        id={elementId}
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      
      {/* Help text shown below if provided */}
      {helpText && (
        <p className="text-xs text-slate-500 mt-1 w-full">{helpText}</p>
      )}
    </div>
  );
}
