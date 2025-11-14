'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Edit, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { AIChange, AISuggestion } from '@/types/resume';

interface AISuggestionsProps {
  changes: AIChange[];
  suggestions: AISuggestion[];
}

export function AISuggestions({ changes, suggestions }: AISuggestionsProps) {
  const getChangeIcon = (type: AIChange['type']) => {
    switch (type) {
      case 'added':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'removed':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getChangeColor = (type: AIChange['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'modified':
        return 'bg-blue-50 border-blue-200';
      case 'removed':
        return 'bg-red-50 border-red-200';
    }
  };

  const getPriorityColor = (priority: AISuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'keyword':
        return '🔑';
      case 'structure':
        return '📐';
      case 'content':
        return '✏️';
    }
  };

  if (changes.length === 0 && suggestions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600">No AI insights available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="changes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="changes">
            Changes Made ({changes.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4 mt-4">
          {changes.length === 0 ? (
            <Card className="p-6 text-center text-slate-600">
              No changes tracked
            </Card>
          ) : (
            changes.map((change, index) => (
              <Card
                key={index}
                className={`p-4 border-2 ${getChangeColor(change.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getChangeIcon(change.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {change.type}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-700">
                        {change.section}
                      </span>
                    </div>

                    {change.original && (
                      <div className="text-sm">
                        <p className="text-slate-500 font-medium mb-1">Before:</p>
                        <p className="text-slate-700 bg-white/50 p-2 rounded border">
                          {change.original}
                        </p>
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="text-slate-500 font-medium mb-1">
                        {change.type === 'removed' ? 'Removed' : 'After'}:
                      </p>
                      <p className="text-slate-700 bg-white/50 p-2 rounded border">
                        {change.modified}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 bg-white/50 p-3 rounded border">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Why:</span> {change.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4 mt-4">
          {suggestions.length === 0 ? (
            <Card className="p-6 text-center text-slate-600">
              No suggestions available
            </Card>
          ) : (
            suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">{getTypeIcon(suggestion.type)}</span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {suggestion.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getPriorityColor(suggestion.priority)}`}
                      >
                        {suggestion.priority} priority
                      </Badge>
                      <span className="text-sm font-semibold text-slate-700">
                        {suggestion.section}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
