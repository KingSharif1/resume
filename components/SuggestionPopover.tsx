/**
 * Suggestion Popover Component
 * 
 * Displays when clicking highlighted text in the preview.
 * Shows the suggestion details and action buttons.
 */

'use client';

import { InlineSuggestion, getSuggestionTypeLabel } from '@/lib/inline-suggestions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit3, MessageSquare } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ReactNode } from 'react';

interface SuggestionPopoverProps {
    suggestion: InlineSuggestion;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onApprove: () => void;
    onDeny: () => void;
    onEdit?: () => void;
    onReply?: () => void;
}

export function SuggestionPopover({
    suggestion,
    children,
    open,
    onOpenChange,
    onApprove,
    onDeny,
    onEdit,
    onReply,
}: SuggestionPopoverProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0"
                side="top"
                align="start"
                sideOffset={5}
            >
                <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {getSuggestionTypeLabel(suggestion.type)}
                        </Badge>
                        <div className={`text-xs px-2 py-0.5 rounded ${suggestion.severity === 'error' ? 'bg-red-100 text-red-700' :
                                suggestion.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                            }`}>
                            {suggestion.severity}
                        </div>
                    </div>

                    {/* Change Preview */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
                                <span className="line-through text-red-600">{suggestion.originalText}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-slate-400">↓</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
                                <span className="text-green-700 font-medium">{suggestion.suggestedText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-700">Why this is better:</span>
                            <br />
                            {suggestion.reason}
                        </p>
                        {suggestion.impact && (
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <span>✓</span>
                                {suggestion.impact}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDeny}
                            className="h-7 text-xs flex-1"
                        >
                            <X className="w-3 h-3 mr-1.5" />
                            Deny
                        </Button>
                        {onReply && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onReply}
                                className="h-7 text-xs flex-1"
                            >
                                <MessageSquare className="w-3 h-3 mr-1.5" />
                                Reply
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="h-7 text-xs flex-1"
                            >
                                <Edit3 className="w-3 h-3 mr-1.5" />
                                Edit
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={onApprove}
                            className="h-7 text-xs flex-1 bg-slate-900 hover:bg-slate-800"
                        >
                            <Check className="w-3 h-3 mr-1.5" />
                            Approve
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
