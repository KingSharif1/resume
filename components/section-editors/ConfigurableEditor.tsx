'use client';

import { useState, useEffect } from 'react';
import { BasicEditor } from '@/components/BasicEditor';
import { SectionValidation } from '@/components/SectionValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

// Define field types
export type FieldType = 'text' | 'textarea' | 'date' | 'dateRange' | 'list' | 'categorizedList' | 'rating';

export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  categories?: string[];
}

interface ConfigurableEditorProps {
  sectionType: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  allowCustomFields?: boolean;
}

export function ConfigurableEditor({
  sectionType,
  fields,
  initialValues = {},
  onChange,
  allowCustomFields = false
}: ConfigurableEditorProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [customFields, setCustomFields] = useState<FieldConfig[]>([]);
  
  // Initialize with provided fields
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // Handle field value changes
  const handleFieldChange = (name: string, value: any) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    onChange(newValues);
  };

  // Add a custom field
  const addCustomField = () => {
    const newField: FieldConfig = {
      type: 'text',
      name: `custom_${customFields.length + 1}`,
      label: `Custom Field ${customFields.length + 1}`
    };
    setCustomFields([...customFields, newField]);
  };

  // Remove a custom field
  const removeCustomField = (index: number) => {
    const newCustomFields = [...customFields];
    const removedField = newCustomFields.splice(index, 1)[0];
    setCustomFields(newCustomFields);
    
    // Also remove the value
    const newValues = { ...values };
    delete newValues[removedField.name];
    setValues(newValues);
    onChange(newValues);
  };

  // Render a field based on its type
  const renderField = (field: FieldConfig) => {
    const { type, name, label, placeholder, required } = field;
    
    switch (type) {
      case 'text':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}{required && ' *'}</Label>
            <Input
              id={name}
              value={values[name] || ''}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}{required && ' *'}</Label>
            <Textarea
              id={name}
              value={values[name] || ''}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
              rows={4}
            />
          </div>
        );
        
      case 'date':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}{required && ' *'}</Label>
            <Input
              id={name}
              type="date"
              value={values[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
            />
          </div>
        );
        
      case 'dateRange':
        return (
          <div key={name} className="space-y-2">
            <Label>{label}{required && ' *'}</Label>
            <div className="flex gap-2 items-center">
              <Input
                id={`${name}_start`}
                type="date"
                value={values[`${name}_start`] || ''}
                onChange={(e) => handleFieldChange(`${name}_start`, e.target.value)}
                required={required}
              />
              <span>to</span>
              <Input
                id={`${name}_end`}
                type="date"
                value={values[`${name}_end`] || ''}
                onChange={(e) => handleFieldChange(`${name}_end`, e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div key={name} className="space-y-2">
            <Label>{label}{required && ' *'}</Label>
            <div className="space-y-2">
              {(values[name] || []).map((item: string, index: number) => (
                <div key={`${name}-${index}`} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newList = [...(values[name] || [])];
                      newList[index] = e.target.value;
                      handleFieldChange(name, newList);
                    }}
                    placeholder={`${label} item`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newList = [...(values[name] || [])];
                      newList.splice(index, 1);
                      handleFieldChange(name, newList);
                    }}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newList = [...(values[name] || []), ''];
                  handleFieldChange(name, newList);
                }}
                className="w-full mt-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {label} Item
              </Button>
            </div>
          </div>
        );
        
      case 'categorizedList':
        // Get categories or use default ones
        const categories = field?.categories || ['Technical', 'Soft', 'Other'];
        return (
          <div key={name} className="space-y-4">
            <Label>{label}{required && ' *'}</Label>
            {categories.map((category: string) => {
              const categoryKey = `${name}_${category.toLowerCase().replace(/\s+/g, '_')}`;
              return (
                <div key={categoryKey} className="space-y-2 bg-slate-50 p-3 rounded-md">
                  <Label className="text-sm font-medium">{category} {label}</Label>
                  <div className="space-y-2">
                    {(values[categoryKey] || []).map((item: string, index: number) => (
                      <div key={`${categoryKey}-${index}`} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const newList = [...(values[categoryKey] || [])];
                            newList[index] = e.target.value;
                            handleFieldChange(categoryKey, newList);
                          }}
                          placeholder={`${category} ${label} item`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newList = [...(values[categoryKey] || [])];
                            newList.splice(index, 1);
                            handleFieldChange(categoryKey, newList);
                          }}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newList = [...(values[categoryKey] || []), ''];
                        handleFieldChange(categoryKey, newList);
                      }}
                      className="w-full mt-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {category} {label}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        );
        
      // Add more field types as needed
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Standard fields */}
      {fields.map(renderField)}
      
      {/* Custom fields */}
      {customFields.map((field, index) => (
        <div key={field.name} className="relative">
          {renderField(field)}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 text-red-500"
            onClick={() => removeCustomField(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      {/* Add custom field button */}
      {allowCustomFields && (
        <Button
          variant="outline"
          size="sm"
          onClick={addCustomField}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      )}
      
      {/* Validation */}
      <SectionValidation 
        sectionType={sectionType} 
        content={JSON.stringify(values)} 
      />
    </div>
  );
}
