/**
 * MylesChatInterface Component
 * 
 * A high-fidelity, production-grade AI chat interface inspired by Perplexity, Claude, and ChatGPT.
 * Features:
 * - "Pro" aesthetic with refined typography and spacing
 * - Auto-expanding textarea for input
 * - Collapsible, grouped history sidebar
 * - Streaming text effect simulation
 * - Markdown-like message rendering styling
 * - Clean, non-distracting UI focused on content
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  User, 
  Sparkles, 
  Menu, 
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Edit,
  Share,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Check,
  X,
  MessageCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export type MessageRole = 'user' | 'assistant';

export interface Suggestion {
  id: string;
  type: 'wording' | 'metric' | 'grammar' | 'keyword';
  title: string;
  originalText: string;
  improvedText: string;
  reason: string;
  status: 'pending' | 'accepted' | 'denied';
}

export interface ReplyContext {
  id: string;
  title: string;
  type: Suggestion['type'];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  suggestion?: Suggestion;
  replyContext?: ReplyContext;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
}

export interface MylesChatProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<void>;
  userName?: string;
  aiName?: string;
  className?: string;
}

// --- Mock Data ---
const MOCK_SESSIONS: ChatSession[] = [
  { id: '1', title: 'React Performance Optimization', updatedAt: dayjs().toDate() },
  { id: '2', title: 'Resume Review: Senior Dev', updatedAt: dayjs().subtract(1, 'day').toDate() },
  { id: '3', title: 'System Design Interview', updatedAt: dayjs().subtract(2, 'day').toDate() },
  { id: '4', title: 'Next.js 14 App Router', updatedAt: dayjs().subtract(5, 'day').toDate() },
  { id: '5', title: 'Tailwind CSS Tips', updatedAt: dayjs().subtract(1, 'week').toDate() },
];

// --- Sub-components ---

const ChatSuggestionCard = ({ 
  suggestion, 
  onAccept, 
  onDeny, 
  onReply 
}: { 
  suggestion: Suggestion; 
  onAccept: (id: string) => void; 
  onDeny: (id: string) => void; 
  onReply: (id: string) => void; 
}) => {
  if (suggestion.status !== 'pending') {
    return (
       <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-3 text-sm text-gray-500">
          {suggestion.status === 'accepted' ? (
             <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <Check size={14} />
             </div>
          ) : (
             <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                <X size={14} />
             </div>
          )}
          <span>
             Suggestion {suggestion.status === 'accepted' ? 'approved' : 'denied'}
          </span>
       </div>
    );
  }

  const getBadgeColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'wording': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'metric': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'grammar': return 'bg-green-100 text-green-700 border-green-200';
      case 'keyword': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 shrink-0">
              <Lightbulb size={14} />
            </div>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide", getBadgeColor(suggestion.type))}>
              {suggestion.title}
            </span>
          </div>
        </div>

        {/* Content Diff */}
        <div className="mb-4 space-y-3">
          <div className="text-gray-400 line-through text-xs md:text-sm leading-relaxed pl-3 border-l-2 border-red-200 bg-red-50/30 p-1.5 rounded-r-md">
            {suggestion.originalText}
          </div>
          
          <div className="flex items-start gap-2">
             <ArrowRight className="text-blue-500 shrink-0 mt-1" size={14} />
             <div className="text-gray-900 font-medium text-xs md:text-sm leading-relaxed bg-blue-50/50 p-2 rounded-md border border-blue-100 w-full">
               {suggestion.improvedText}
             </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4 text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="font-semibold text-gray-800 not-italic">Why: </span>
          {suggestion.reason}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-2">
          <button 
            onClick={() => onDeny(suggestion.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={14} />
            Deny
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onReply(suggestion.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all"
            >
              <MessageSquare size={14} />
              Reply
            </button>
            <button 
              onClick={() => onAccept(suggestion.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Check size={14} />
              Approve
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder,
  disabled 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className="w-full resize-none bg-transparent border-0 focus:ring-0 p-3 max-h-[200px] overflow-y-auto text-sm md:text-base leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent outline-none"
      style={{ minHeight: '44px' }}
    />
  );
};

const SidebarItem = ({ 
  session, 
  isActive, 
  onClick 
}: { 
  session: ChatSession; 
  isActive: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
      isActive 
        ? "bg-gray-100 text-gray-900 font-medium" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    )}
  >
    <MessageSquare size={16} className={cn("shrink-0", isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")} />
    <span className="truncate flex-1">{session.title}</span>
  </button>
);

const MessageBubble = ({ 
  message, 
  isLast, 
  onAcceptSuggestion, 
  onDenySuggestion, 
  onReplySuggestion 
}: { 
  message: Message; 
  isLast: boolean;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onDenySuggestion?: (suggestionId: string) => void;
  onReplySuggestion?: (suggestionId: string) => void;
}) => {
  const isUser = message.role === 'user';
  
  const getBadgeIcon = (type: Suggestion['type']) => {
    return <Lightbulb size={12} />;
  };

  const getBadgeColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'wording': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'metric': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'grammar': return 'bg-green-100 text-green-700 border-green-200';
      case 'keyword': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  return (
    <div className={cn(
      "flex w-full gap-4 md:gap-6 py-6 md:py-8",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full border shadow-sm",
        isUser ? "bg-white border-gray-100" : "bg-black border-black text-white"
      )}>
        {isUser ? <User size={18} className="text-gray-600" /> : <Sparkles size={18} />}
      </div>

      {/* Content */}
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "font-medium text-xs text-gray-400 select-none",
          isUser ? "text-right mr-1" : "ml-1"
        )}>
          {isUser ? "You" : "Myles"}
        </div>
        
        <div className={cn(
          "prose prose-sm md:prose-base max-w-none break-words leading-7 flex flex-col",
          isUser 
            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md" 
            : "text-gray-800 px-1"
        )}>
          {/* Reply Context Attachment */}
          {message.replyContext && (
            <div className={cn(
              "mb-3 flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium border border-blue-400/30 bg-blue-700/30",
              !isUser && "bg-gray-50 border-gray-200 text-gray-600"
            )}>
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-white shrink-0",
                !isUser && "bg-yellow-100 text-yellow-700"
              )}>
                <Lightbulb size={12} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="opacity-70 text-[10px] uppercase tracking-wider">Replying to suggestion</span>
                <span className="truncate">{message.replyContext.title}</span>
              </div>
            </div>
          )}

          {message.content.split('\n').map((line, i) => (
            <p key={i} className={cn(i > 0 && "mt-4")}>{line}</p>
          ))}
        </div>

        {/* Suggestion Card (AI Only) */}
        {!isUser && message.suggestion && (
           <ChatSuggestionCard 
              suggestion={message.suggestion}
              onAccept={() => onAcceptSuggestion?.(message.suggestion!.id)}
              onDeny={() => onDenySuggestion?.(message.suggestion!.id)}
              onReply={() => onReplySuggestion?.(message.suggestion!.id)}
           />
        )}

        {/* Action Row for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Copy size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <RotateCcw size={14} />
            </button>
            <div className="h-3 w-[1px] bg-gray-200 mx-1" />
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <ThumbsUp size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <ThumbsDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

export function MylesChatInterface({
  initialMessages = [],
  onSendMessage,
  userName = "Visitor",
  aiName = "Myles",
  className
}: MylesChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize with some dummy messages if empty for better preview
  const [replyingTo, setReplyingTo] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm Myles, your AI career coach. I can help review your resume, prepare for interviews, or discuss career strategies. How can I help you today?",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAcceptSuggestion = (id: string) => {
    setMessages(prev => prev.map(m => {
       if (m.suggestion?.id === id) {
         return { ...m, suggestion: { ...m.suggestion!, status: 'accepted' } };
       }
       return m;
    }));
  };

  const handleDenySuggestion = (id: string) => {
    setMessages(prev => prev.map(m => {
       if (m.suggestion?.id === id) {
         return { ...m, suggestion: { ...m.suggestion!, status: 'denied' } };
       }
       return m;
    }));
  };

  const handleReplySuggestion = (id: string) => {
    // Find the suggestion
    const msg = messages.find(m => m.suggestion?.id === id);
    if (msg?.suggestion) {
       setReplyingTo(msg.suggestion);
       // Focus input
       const textarea = document.querySelector('textarea');
       if (textarea) textarea.focus();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // Check if there's a command to generate a suggestion (for demo purposes)
    const shouldGenerateSuggestion = inputValue.toLowerCase().includes('suggest') || inputValue.toLowerCase().includes('fix');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      replyContext: replyingTo ? {
        id: replyingTo.id,
        title: replyingTo.title,
        type: replyingTo.type
      } : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setReplyingTo(null);
    setIsTyping(true);

    if (onSendMessage) {
      await onSendMessage(newUserMsg.content);
    } else {
      // Simulation
      setTimeout(() => {
        const responses = [
          "That's a great question. Based on your experience, I'd suggest highlighting your leadership in that role.",
          "I can definitely help with that. Here's a structured approach we could take:\n\n1. Analyze the job description\n2. Match your key skills\n3. Tailor your summary statement",
          "Could you elaborate more on the specific technologies you used in that project? It would help refine the resume bullet points.",
          "This looks solid! However, I'd recommend quantifying the impact. For example, 'Improved load times by 40%' instead of just 'Optimized performance'.",
          "Myles thinks you're on the right track! Let's polish the formatting next."
        ];
        
        let randomResponse = responses[Math.floor(Math.random() * responses.length)];
        let newSuggestion: Suggestion | undefined;

        if (shouldGenerateSuggestion) {
           randomResponse = "I noticed a potential improvement in your work history section. Quantifying your achievements could make a bigger impact.";
           newSuggestion = {
              id: Date.now().toString(),
              type: 'metric',
              title: 'Add Metric',
              originalText: 'Responsible for leading a team of developers.',
              improvedText: 'Led a cross-functional team of 8 developers, delivering 3 major features.',
              reason: 'Adding specific numbers builds credibility.',
              status: 'pending'
           };
        }
        
        const newAiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: randomResponse,
          timestamp: new Date(),
          suggestion: newSuggestion
        };
        setMessages(prev => [...prev, newAiMsg]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group sessions by time
  const todaySessions = MOCK_SESSIONS.slice(0, 2);
  const yesterdaySessions = MOCK_SESSIONS.slice(2, 3);
  const olderSessions = MOCK_SESSIONS.slice(3);

  return (
    <div className={cn("flex h-full w-full bg-white text-slate-900 font-sans overflow-hidden border rounded-xl shadow-2xl ring-1 ring-slate-900/5", className)}>
      
      {/* Sidebar - Desktop */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="hidden md:flex flex-col border-r bg-gray-50/50 backdrop-blur-sm h-full overflow-hidden relative"
      >
        <div className="p-4 flex flex-col h-full min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
               <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                 <span className="text-xs font-bold">M</span>
               </div>
               <span>Myles</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button 
            className="flex items-center gap-2 w-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm transition-all mb-6 group"
            onClick={() => setMessages([])}
          >
            <Plus size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium">New chat</span>
          </button>

          {/* History Lists */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Today</h3>
              <div className="space-y-0.5">
                {todaySessions.map(s => <SidebarItem key={s.id} session={s} isActive={s.id === '1'} onClick={() => {}} />)}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Yesterday</h3>
              <div className="space-y-0.5">
                {yesterdaySessions.map(s => <SidebarItem key={s.id} session={s} isActive={false} onClick={() => {}} />)}
              </div>
            </div>

             <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Previous 7 Days</h3>
              <div className="space-y-0.5">
                {olderSessions.map(s => <SidebarItem key={s.id} session={s} isActive={false} onClick={() => {}} />)}
              </div>
            </div>
          </div>

          {/* User Profile Bottom */}
          <div className="mt-4 pt-4 border-t flex items-center gap-3 px-1 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">Pro Plan</p>
            </div>
            <MoreHorizontal size={16} className="text-gray-400" />
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Mobile Header / Sidebar Toggle */}
        <div className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-white z-10 sticky top-0">
           <div className="flex items-center gap-2">
             {!isSidebarOpen && (
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 -ml-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors md:block hidden"
               >
                 <PanelLeftOpen size={18} />
               </button>
             )}
             <button className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-md text-gray-500">
                <Menu size={20} />
             </button>
             <span className="font-semibold text-gray-800 md:hidden">Myles</span>
             <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Myles 3.5 Sonnet
             </div>
           </div>
           
           <div className="flex items-center gap-1">
             <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
               <Share size={18} />
             </button>
           </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0">
          <div className="max-w-3xl mx-auto w-full pb-32 pt-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <MessageBubble 
                    message={msg} 
                    isLast={idx === messages.length - 1} 
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onDenySuggestion={handleDenySuggestion}
                    onReplySuggestion={handleReplySuggestion}
                  />
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full gap-4 md:gap-6 py-6 md:py-8 flex-row"
                >
                   <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full border bg-black border-black text-white shadow-sm">
                      <Sparkles size={18} />
                   </div>
                   <div className="flex items-center gap-1 pt-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto w-full relative">
            
            {replyingTo && (
               <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-t-xl mx-1 px-4 py-2 text-sm text-blue-700 -mb-1 pb-3 relative z-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Lightbulb size={14} className="shrink-0 text-blue-500" />
                    <span className="font-medium truncate">Replying to suggestion: {replyingTo.title}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600 shrink-0">
                    <X size={14} />
                  </button>
               </div>
            )}

            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all p-2 z-10">
               {/* Attachment Button */}
               <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors shrink-0 mb-0.5">
                  <Plus size={20} />
               </button>

               <AutoResizeTextarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Myles..."
                  disabled={isTyping}
               />
               
               <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className={cn(
                    "p-2.5 rounded-xl transition-all shrink-0 mb-0.5",
                    inputValue.trim() 
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Send size={18} />
               </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">
                Myles can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MylesChatInterface;
