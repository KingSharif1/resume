import React, { useState } from 'react';
import { 
  Lightbulb, 
  Check, 
  X, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  BarChart3,
  RefreshCw,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export interface Suggestion {
  id: string;
  type: 'wording' | 'metric' | 'grammar' | 'keyword';
  title: string;
  originalText: string;
  improvedText: string;
  reason: string;
  status: 'pending' | 'accepted' | 'denied';
}

export interface ResumeAnalysisDashboardProps {
  score?: number;
  suggestions?: Suggestion[];
  onAccept?: (id: string) => void;
  onDeny?: (id: string) => void;
  onReply?: (id: string, message: string) => void;
  onScan?: () => void;
}

// --- Components ---

const SuggestionCard = ({ 
  suggestion, 
  onAccept, 
  onDeny, 
  onReply 
}: { 
  suggestion: Suggestion; 
  onAccept: (id: string) => void; 
  onDeny: (id: string) => void; 
  onReply: (id: string, message: string) => void; 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(suggestion.id, replyText);
      setIsReplying(false);
      setReplyText("");
    }
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

  if (suggestion.status !== 'pending') return null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 group hover:shadow-md transition-all duration-300"
    >
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100 shadow-sm">
              <Lightbulb size={18} />
            </div>
            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wide", getBadgeColor(suggestion.type))}>
              {suggestion.title}
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Content Diff */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="text-gray-400 line-through text-sm md:text-base leading-relaxed pl-4 border-l-2 border-red-200 bg-red-50/30 p-2 rounded-r-md">
              {suggestion.originalText}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
             <ArrowRight className="text-blue-500 shrink-0 mt-1" size={16} />
             <div className="text-gray-900 font-medium text-sm md:text-base leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 w-full">
               {suggestion.improvedText}
             </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6 text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
          <span className="font-semibold text-gray-800 not-italic">Why: </span>
          {suggestion.reason}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 mt-2">
          <button 
            onClick={() => onDeny(suggestion.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
            Deny
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border",
                isReplying 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <MessageSquare size={16} />
              Reply
            </button>
            <button 
              onClick={() => onAccept(suggestion.id)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Check size={16} />
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Inline Reply Area */}
      <AnimatePresence>
        {isReplying && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-blue-100 bg-blue-50/30 overflow-hidden"
          >
            <div className="p-4 md:p-5 flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ask a question or request changes..."
                  className="w-full min-h-[80px] p-3 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm resize-none"
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  Enter to send
                </div>
              </div>
              <button 
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                className="self-end p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ResumeAnalysisDashboard({
  score = 93,
  suggestions: initialSuggestions = [
    {
      id: '1',
      type: 'wording',
      title: 'Better Wording',
      originalText: 'Developed and maintained software applications using React.js, achieving minimal QA returns through rigorous code reviews.',
      improvedText: 'Engineered robust software applications using React.js, reducing QA returns by 40% through implementation of rigorous code review standards.',
      reason: 'Add quantifiable metrics to achievements to showcase impact rather than just responsibilities.',
      status: 'pending'
    },
    {
      id: '2',
      type: 'metric',
      title: 'Add Metric',
      originalText: 'Responsible for leading a team of developers to build the new mobile app.',
      improvedText: 'Spearheaded a cross-functional team of 8 developers to launch the new mobile app 2 weeks ahead of schedule.',
      reason: 'Specific numbers (team size, timeline) build credibility and show the scale of your leadership.',
      status: 'pending'
    },
    {
      id: '3',
      type: 'keyword',
      title: 'Missing Keywords',
      originalText: 'Used various cloud technologies for deployment.',
      improvedText: 'Deployed scalable solutions using AWS (EC2, S3) and Docker containers for consistent environments.',
      reason: 'Including specific high-demand technical keywords (AWS, Docker) improves ATS ranking.',
      status: 'pending'
    }
  ],
  onAccept,
  onDeny,
  onReply,
  onScan
}: ResumeAnalysisDashboardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [isScanned, setIsScanned] = useState(true);

  const handleAccept = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s));
    if (onAccept) onAccept(id);
  };

  const handleDeny = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'denied' } : s));
    if (onDeny) onDeny(id);
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50 min-h-screen md:min-h-0 md:h-full p-4 md:p-0">
      
      {/* Header Dashboard Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
               <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resume Analysis</h1>
              <p className="text-gray-500 text-sm mt-1">
                Score: <span className={cn("font-bold", score >= 90 ? "text-green-600" : "text-amber-600")}>{score}/100</span> • {pendingCount} Suggestions remaining
              </p>
            </div>
          </div>
          
          <button 
            onClick={onScan}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Sparkles size={18} />
            <span>Rescan Resume</span>
          </button>
        </div>

        {/* Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Optimization Score</span>
            <span>{score}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${score}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={cn(
                 "h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]",
                 score >= 90 ? "bg-gradient-to-r from-emerald-500 to-green-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"
               )} 
             />
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-4">
           <div className="flex items-center gap-2">
             <Sparkles size={18} className="text-amber-500" />
             <h2 className="text-lg font-bold text-gray-800">AI Suggestions</h2>
           </div>
           {pendingCount > 0 && (
             <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
               {pendingCount} New
             </span>
           )}
        </div>

        <AnimatePresence mode="popLayout">
          {suggestions.filter(s => s.status === 'pending').map(suggestion => (
            <SuggestionCard 
              key={suggestion.id} 
              suggestion={suggestion} 
              onAccept={handleAccept} 
              onDeny={handleDeny}
              onReply={onReply || ((id, msg) => console.log('Replied:', id, msg))}
            />
          ))}
        </AnimatePresence>

        {pendingCount === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              You've reviewed all current suggestions. Great job improving your resume!
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}
