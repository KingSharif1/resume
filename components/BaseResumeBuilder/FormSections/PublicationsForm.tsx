'use client';

import { useState } from 'react';
import { Publication, generateId } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface PublicationsFormProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
}

export function PublicationsForm({ publications, onChange }: PublicationsFormProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const addPublication = () => {
    const newPublication: Publication = {
      id: generateId(),
      title: '',
      publisher: '',
      date: '',
      url: '',
      description: '',
      authors: []
    };

    const updated = [...publications, newPublication];
    onChange(updated);

    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(newPublication.id);
      return newSet;
    });
  };

  const updatePublication = (id: string, updates: Partial<Publication>) => {
    const updated = publications.map(pub =>
      pub.id === id ? { ...pub, ...updates } : pub
    );
    onChange(updated);
  };

  const removePublication = (id: string) => {
    const updated = publications.filter(pub => pub.id !== id);
    onChange(updated);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Publications</h3>
          <p className="text-sm text-slate-600">Add your published works</p>
        </div>
        <Button onClick={addPublication} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Publication
        </Button>
      </div>

      {publications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 mb-4">No publications added yet</p>
          <Button onClick={addPublication} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your Publication
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => {
            const isExpanded = expandedItems.has(pub.id);

            return (
              <Card key={pub.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {pub.title || 'New Publication'}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {pub.publisher}
                        {pub.date && ` • ${pub.date}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(pub.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePublication(pub.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${pub.id}`}>Title *</Label>
                        <Input
                          id={`title-${pub.id}`}
                          value={pub.title}
                          onChange={(e) => updatePublication(pub.id, { title: e.target.value })}
                          placeholder="Research Paper Title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`publisher-${pub.id}`}>Publisher/Journal *</Label>
                        <Input
                          id={`publisher-${pub.id}`}
                          value={pub.publisher}
                          onChange={(e) => updatePublication(pub.id, { publisher: e.target.value })}
                          placeholder="IEEE, Nature, Medium"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`date-${pub.id}`}>Publication Date</Label>
                        <Input
                          id={`date-${pub.id}`}
                          type="month"
                          value={pub.date || ''}
                          onChange={(e) => updatePublication(pub.id, { date: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`url-${pub.id}`}>URL</Label>
                        <Input
                          id={`url-${pub.id}`}
                          value={pub.url || ''}
                          onChange={(e) => updatePublication(pub.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${pub.id}`}>Description</Label>
                      <Textarea
                        id={`description-${pub.id}`}
                        value={pub.description || ''}
                        onChange={(e) => updatePublication(pub.id, { description: e.target.value })}
                        placeholder="Abstract or summary..."
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
