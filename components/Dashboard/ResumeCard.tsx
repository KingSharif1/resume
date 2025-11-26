import { BaseResume } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MoreVertical, Edit, Trash2, Copy, FileText, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

interface ResumeCardProps {
  resume: BaseResume;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onDuplicate }: ResumeCardProps) {
  const router = useRouter();

  return (
    <div className="group relative w-[280px] flex-shrink-0">
      <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl">
        {/* Thumbnail Area */}
        <div 
          className="aspect-[1/1.4] bg-slate-50 relative cursor-pointer group-hover:bg-slate-100 transition-colors border-b border-slate-100"
          onClick={() => router.push(`/builder?id=${resume.id}`)}
        >
          {/* Placeholder for actual preview thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="w-16 h-16 text-slate-900" />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white/90 hover:bg-white text-slate-900 shadow-sm font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Resume
            </Button>
          </div>
        </div>

        {/* Metadata Area */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate text-base" title={resume.title}>
                {resume.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {resume.contact_info?.firstName ? `${resume.contact_info.firstName} ${resume.contact_info.lastName}` : 'Untitled Profile'}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-medium">
                Last edited {new Date(resume.updated_at).toLocaleDateString()}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/builder?id=${resume.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(resume.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-purple-600 focus:text-purple-700 focus:bg-purple-50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tailor to Job
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                  onClick={() => onDelete(resume.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
}
