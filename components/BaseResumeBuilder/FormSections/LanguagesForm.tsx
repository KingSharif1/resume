'use client';

import { Language, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { UnifiedTextField } from '@/components/fields';

interface LanguagesFormProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

const PROFICIENCY_LEVELS = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Basic', label: 'Basic' }
] as const;

export function LanguagesForm({ languages, onChange }: LanguagesFormProps) {
  const addLanguage = () => {
    const newLanguage: Language = {
      id: generateId(),
      name: '',
      proficiency: 'Intermediate',
      certification: ''
    };

    onChange([...languages, newLanguage]);
  };

  const updateLanguage = (id: string, updates: Partial<Language>) => {
    const updated = languages.map(lang => 
      lang.id === id ? { ...lang, ...updates } : lang
    );
    onChange(updated);
  };

  const removeLanguage = (id: string) => {
    const updated = languages.filter(lang => lang.id !== id);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Languages</h3>
          <p className="text-sm text-slate-600">Add languages you speak and your proficiency level</p>
        </div>
        <Button onClick={addLanguage} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No languages added yet</p>
          <Button onClick={addLanguage} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Language
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {languages.map((language) => (
            <Card key={language.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UnifiedTextField
                    id={`languages-${language.id}-name`}
                    section="languages"
                    fieldKey="name"
                    itemId={language.id}
                    label="Language"
                    value={language.name}
                    onChange={(value) => updateLanguage(language.id, { name: value })}
                    placeholder="English, Spanish, French..."
                    required
                  />
                  <div>
                    <Label htmlFor={`languages-${language.id}-proficiency`}>Proficiency Level *</Label>
                    <Select
                      value={language.proficiency}
                      onValueChange={(value) => updateLanguage(language.id, { proficiency: value as Language['proficiency'] })}
                    >
                      <SelectTrigger id={`languages-${language.id}-proficiency`} className="mt-1">
                        <SelectValue placeholder="Select proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <UnifiedTextField
                      id={`languages-${language.id}-certification`}
                      section="languages"
                      fieldKey="certification"
                      itemId={language.id}
                      label="Certification"
                      value={language.certification || ''}
                      onChange={(value) => updateLanguage(language.id, { certification: value })}
                      placeholder="TOEFL, IELTS, etc."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(language.id)}
                      className="text-red-600 hover:text-red-700 mb-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
