'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronDown, ChevronRight, Sparkles, Edit, MessageSquare } from 'lucide-react';
import { ChangelogEntry, ChangelogGroup, groupChangelogByDate, formatChangelogTime, formatChangelogDate } from '@/types/changelog';
import { cn } from '@/lib/utils';

interface ChangelogPanelProps {
  entries: ChangelogEntry[];
  maxHeight?: string;
}

export function ChangelogPanel({ entries, maxHeight = '400px' }: ChangelogPanelProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set(['today']));
  
  const groups = groupChangelogByDate(entries);
  
  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };
  
  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'suggestion_applied':
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      case 'manual_edit':
        return <Edit className="w-3.5 h-3.5 text-gray-600" />;
      case 'ai_chat':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-600" />;
    }
  };
  
  const getTypeBadge = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'suggestion_applied':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">AI Suggestion</Badge>;
      case 'manual_edit':
        return <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200 text-[10px]">Manual Edit</Badge>;
      case 'ai_chat':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">AI Chat</Badge>;
      default:
        return null;
    }
  };
  
  if (entries.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No changes yet</p>
          <p className="text-xs text-slate-400 mt-1">Your resume edits will appear here</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            Change History
          </CardTitle>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            {entries.length} {entries.length === 1 ? 'change' : 'changes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {groups.map((group) => {
            const isExpanded = expandedDates.has(group.date);
            const displayDate = formatChangelogDate(group.date);
            
            return (
              <div key={group.date} className="border-b border-slate-100 last:border-0">
                <button
                  onClick={() => toggleDate(group.date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-700">{displayDate}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {group.entries.length}
                    </Badge>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(entry.type)}
                            <span className="text-xs font-medium text-slate-700">
                              {entry.section}
                            </span>
                            {entry.suggestionType && (
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {entry.suggestionType}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {formatChangelogTime(entry.timestamp)}
                          </span>
                        </div>
                        
                        {getTypeBadge(entry.type)}
                        
                        {entry.reason && (
                          <p className="text-xs text-slate-600 mt-2 italic">
                            {entry.reason}
                          </p>
                        )}
                        
                        <div className="mt-2 space-y-1">
                          {entry.before && (
                            <div className="text-xs text-slate-500 line-through">
                              {entry.before.substring(0, 80)}
                              {entry.before.length > 80 ? '...' : ''}
                            </div>
                          )}
                          <div className="text-xs text-slate-700 font-medium">
                            {entry.after.substring(0, 80)}
                            {entry.after.length > 80 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
