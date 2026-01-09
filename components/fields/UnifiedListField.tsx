'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedListFieldProps, generateFieldId, generateListItemId, FieldSuggestion } from '@/lib/fields/field-types';

export function UnifiedListField({
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
  itemSuggestions,
  highlightedItemIndex,
  onAcceptSuggestion,
  onDismissSuggestion,
  error,
  helpText,
  className,
  minItems = 0,
  maxItems = 10,
  itemPlaceholder,
}: UnifiedListFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const [highlightedItems, setHighlightedItems] = useState<Set<number>>(new Set());
  
  // Generate base element ID
  const baseElementId = id || generateFieldId(section, fieldKey, itemId, itemIndex);
  
  // Handle highlight effect for specific item
  useEffect(() => {
    if (highlightedItemIndex !== undefined && highlightedItemIndex >= 0) {
      setHighlightedItems(prev => new Set(prev).add(highlightedItemIndex));
      
      // Scroll to the item
      const itemRef = itemRefs.current.get(highlightedItemIndex);
      if (itemRef) {
        itemRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        itemRef.focus();
      }
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => {
        setHighlightedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(highlightedItemIndex);
          return newSet;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedItemIndex]);

  // Handle container highlight
  useEffect(() => {
    if (highlighted) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  const addItem = () => {
    if (value.length < maxItems) {
      onChange([...value, '']);
    }
  };

  const removeItem = (index: number) => {
    if (value.length > minItems) {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleAcceptItemSuggestion = (index: number, suggestion: FieldSuggestion) => {
    const newValue = value[index].replace(
      new RegExp(suggestion.original, 'gi'),
      suggestion.replacement
    );
    updateItem(index, newValue);
    if (onAcceptSuggestion) {
      onAcceptSuggestion(suggestion);
    }
  };

  const handleDismissItemSuggestion = (suggestion: FieldSuggestion) => {
    if (onDismissSuggestion) {
      onDismissSuggestion(suggestion);
    }
  };

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label 
          className={cn(
            'text-sm font-medium',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
        
        {value.length < maxItems && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-blue-600 hover:text-blue-700"
            onClick={addItem}
            disabled={disabled}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {value.map((item, index) => {
          const itemElementId = generateListItemId(section, fieldKey, itemId, itemIndex || 0, index);
          const itemSuggestion = itemSuggestions?.get(index);
          const isItemHighlighted = highlightedItems.has(index);
          
          return (
            <div key={index} className="flex items-start gap-2 group">
              <div className="flex items-center h-9 text-slate-300 cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
              
              <div className="flex-1 relative">
                <Input
                  ref={(el) => {
                    if (el) itemRefs.current.set(index, el);
                  }}
                  id={itemElementId}
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={itemPlaceholder || placeholder || `Item ${index + 1}`}
                  disabled={disabled}
                  className={cn(
                    'transition-all duration-200',
                    isItemHighlighted && 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50',
                    itemSuggestion && 'border-blue-400 bg-blue-50/50 pr-32'
                  )}
                />
                
                {/* Inline suggestion for this item */}
                {itemSuggestion && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded max-w-[80px] truncate">
                      {itemSuggestion.replacement}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => handleAcceptItemSuggestion(index, itemSuggestion)}
                      title="Accept suggestion"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      onClick={() => handleDismissItemSuggestion(itemSuggestion)}
                      title="Dismiss suggestion"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              
              {value.length > minItems && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
        
        {value.length === 0 && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 text-sm text-slate-500 border-dashed"
            onClick={addItem}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {label.toLowerCase()}
          </Button>
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
