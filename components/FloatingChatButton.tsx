/**
 * Floating AI Chat Button - Myles
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
                'fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-300',
                'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
                'text-white border-2 border-white ring-4 ring-blue-100',
                'hover:scale-110 active:scale-95',
                isOpen && 'scale-0 opacity-0 pointer-events-none'
            )}
            size="icon"
        >
            {isOpen ? (
                <X className="w-6 h-6" />
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-serif">M</span>
                        <span className="text-[8px] font-semibold -mt-1">AI</span>
                    </div>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </>
            )}
        </Button>
    );
}
