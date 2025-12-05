'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeProfile } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface Suggestion {
    id: number;
    type: 'improvement' | 'missing_skill' | 'keyword';
    title: string;
    description: string;
    action: string;
    data: any;
}

interface AISuggestionsProps {
    profile: ResumeProfile;
    onUpdateProfile: (updates: Partial<ResumeProfile>) => void;
}

export function AISuggestions({ profile, onUpdateProfile }: AISuggestionsProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedSuggestions, setAcceptedSuggestions] = useState<number[]>([]);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
            });
            
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
                // Reset dismissed/accepted when fetching new ones? 
                // Maybe keep tracking IDs but for now simple is fine.
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch on mount or when profile changes significantly? 
    // For now, fetch once on mount to avoid spamming API.
    useEffect(() => {
        if (suggestions.length === 0) {
            fetchSuggestions();
        }
    }, []);

    const visibleSuggestions = suggestions.filter(s => 
        !acceptedSuggestions.includes(s.id) && !dismissedSuggestions.includes(s.id)
    );

    const handleAccept = (suggestion: Suggestion) => {
        setAcceptedSuggestions(prev => [...prev, suggestion.id]);
        
        try {
            if (suggestion.action === 'add_skill') {
                const { category, skill } = suggestion.data;
                const newSkills = { ...profile.skills };
                
                // If category exists, add to it
                if (newSkills[category]) {
                    if (!newSkills[category].includes(skill)) {
                        newSkills[category] = [...newSkills[category], skill];
                    }
                } else {
                    // Create new category
                    newSkills[category] = [skill];
                }
                
                onUpdateProfile({ skills: newSkills });
                toast.success(`Added ${skill} to ${category}`);
            } 
            else if (suggestion.action === 'update_summary') {
                onUpdateProfile({ 
                    summary: { content: suggestion.data.content } 
                });
                toast.success('Summary updated');
            }
            else if (suggestion.action === 'update_experience') {
                const newExperience = profile.experience.map(exp => {
                    if (exp.id === suggestion.data.id) {
                        return { ...exp, ...suggestion.data };
                    }
                    return exp;
                });
                onUpdateProfile({ experience: newExperience });
                toast.success('Experience updated');
            }
        } catch (error) {
            console.error('Error applying suggestion:', error);
            toast.error('Failed to apply change');
        }
    };

    const handleDismiss = (id: number) => {
        setDismissedSuggestions(prev => [...prev, id]);
    };

    if (isLoading && suggestions.length === 0) {
        return (
            <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                    </div>
                </div>
                <div className="h-20 bg-slate-100 rounded-xl" />
            </div>
        );
    }

    if (visibleSuggestions.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex-1 flex items-center gap-3 text-left"
                    >
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">AI Suggestions</h2>
                            <p className="text-xs text-slate-500">{visibleSuggestions.length} improvements available</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-blue-600"
                            onClick={fetchSuggestions}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </Button>
                        <button onClick={() => setIsOpen(!isOpen)}>
                             <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-90")} />
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                        {visibleSuggestions.map((suggestion) => (
                            <div key={suggestion.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{suggestion.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{suggestion.description}</p>
                                    </div>
                                    {suggestion.type === 'missing_skill' && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full whitespace-nowrap">Skill</span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-3">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-7 text-xs bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                                        onClick={() => handleDismiss(suggestion.id)}
                                    >
                                        Dismiss
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm ml-auto"
                                        onClick={() => handleAccept(suggestion)}
                                    >
                                        <Check className="w-3 h-3 mr-1.5" />
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
