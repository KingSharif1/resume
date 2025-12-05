/**
 * Floating AI Chat Button
 * 
 * Always-visible button to open the AI chat widget
 */

'use client';

import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingChatButtonProps {
    isOpen: boolean;
    onClick: () => void;
    unreadCount?: number;
}

export function FloatingChatButton({ isOpen, onClick, unreadCount = 0 }: FloatingChatButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300',
                'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
                'text-white border-2 border-white',
                'hover:scale-110 active:scale-95',
                isOpen && 'scale-0 opacity-0 pointer-events-none'
            )}
            size="icon"
        >
            {isOpen ? (
                <X className="w-6 h-6" />
            ) : (
                <>
                    <MessageSquare className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </>
            )}
        </Button>
    );
}
