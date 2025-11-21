'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Settings, Save } from 'lucide-react';
import { FieldConfig, FieldType } from './ConfigurableEditor';

interface CustomSectionBuilderProps {
  onSave: (config: { title: string; fields: FieldConfig[] }) => void;
  onCancel: () => void;
}

const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: 'text', label: 'Text Field', description: 'Single line text input' },
  { value: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'dateRange', label: 'Date Range', description: 'Start and end date' },
  { value: 'list', label: 'List', description: 'List of items' },
  { value: 'categorizedList', label: 'Categorized List', description: 'List with categories' },
];

export function CustomSectionBuilder({ onSave, onCancel }: CustomSectionBuilderProps) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<FieldConfig[]>([
    { type: 'text', name: 'title', label: 'Title', required: true }
  ]);
  
  const addField = () => {
    const fieldName = `field_${fields.length + 1}`;
    setFields([...fields, {
      type: 'text',
      name: fieldName,
      label: `Field ${fields.length + 1}`,
      required: false
    }]);
  };
  
  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };
  
  const updateField = (index: number, field: Partial<FieldConfig>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    
    // If field type changes, reset any type-specific properties
    if (field.type) {
      if (field.type === 'categorizedList') {
        newFields[index].categories = ['Category 1', 'Category 2', 'Category 3'];
      } else {
        delete newFields[index].categories;
      }
    }
    
    // Update name based on label if it's a new field
    if (field.label && newFields[index].name.startsWith('field_')) {
      newFields[index].name = field.label.toLowerCase().replace(/\s+/g, '_');
    }
    
    setFields(newFields);
  };
  
  const handleSave = () => {
    if (!title) {
      alert('Please enter a section title');
      return;
    }
    
    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }
    
    onSave({ title, fields });
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Custom Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Publications, Volunteering, etc."
              className="mt-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Fields</Label>
              <Button onClick={addField} size="sm" variant="outline" className="h-8">
                <Plus className="w-4 h-4 mr-1" />
                Add Field
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <Card key={index} className="p-3 bg-slate-50 border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm">{field.label || `Field ${index + 1}`}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                      className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Label"
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as FieldType })}
                      >
                        <SelectTrigger className="h-8 text-sm mt-1">
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`required-${index}`}
                      checked={field.required || false}
                      onCheckedChange={(checked) => updateField(index, { required: checked })}
                    />
                    <Label htmlFor={`required-${index}`} className="text-xs">Required Field</Label>
                  </div>
                  
                  {field.type === 'categorizedList' && (
                    <div>
                      <Label className="text-xs">Categories (comma-separated)</Label>
                      <Input
                        value={field.categories?.join(', ')}
                        onChange={(e) => {
                          const categories = e.target.value
                            .split(',')
                            .map(cat => cat.trim())
                            .filter(Boolean);
                          updateField(index, { categories });
                        }}
                        placeholder="Category 1, Category 2, Category 3"
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Custom Section
        </Button>
      </div>
    </div>
  );
}
