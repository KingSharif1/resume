import { BaseResume } from '@/app/dashboard/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MoreVertical, Edit, Trash2, Copy, FileText, Sparkles, Star, Briefcase, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ResumeCardProps {
  resume: BaseResume;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleStar?: (id: string, currentStatus: boolean) => void;
}

export function ResumeCard({ resume, onDelete, onDuplicate, onToggleStar }: ResumeCardProps) {
  const router = useRouter();

  // Get skills for preview - show more skills
  const skillCategories = Object.keys(resume.skills || {});
  const allSkills = skillCategories.flatMap(cat => resume.skills[cat] || []).slice(0, 10);

  return (
    <div className="group relative w-[280px] flex-shrink-0">
      <Card className={cn(
        "overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-xl",
        resume.is_starred ? "border-yellow-400 ring-1 ring-yellow-400/50" : "border-slate-200"
      )}>
        {/* Thumbnail Area - Full Resume Preview */}
        <div
          className="aspect-[1/1.4] bg-white relative cursor-pointer group-hover:bg-slate-50/30 transition-colors border-b border-slate-100 overflow-hidden"
          onClick={() => router.push(`/builder?id=${resume.id}`)}
        >
          {/* Star Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar?.(resume.id, resume.is_starred);
            }}
            className={cn(
              "absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200",
              resume.is_starred
                ? "bg-white text-yellow-400 shadow-sm opacity-100"
                : "bg-black/5 text-slate-400 hover:bg-white hover:text-yellow-400 opacity-0 group-hover:opacity-100"
            )}
          >
            <Star className={cn("w-4 h-4", resume.is_starred && "fill-current")} />
          </button>

          {/* Full Resume Preview Content - Scaled down to look like actual resume */}
          <div className="p-2.5 h-full overflow-hidden" style={{ fontSize: '5.5px', lineHeight: '1.3' }}>
            {/* Header - Name & Contact */}
            <div className="text-center mb-1.5 pb-1 border-b border-slate-300">
              <h4 className="font-bold text-slate-900" style={{ fontSize: '10px' }}>
                {resume.contact_info?.firstName || 'First'} {resume.contact_info?.lastName || 'Last'}
              </h4>
              <div className="flex items-center justify-center gap-1 text-slate-600 mt-0.5 flex-wrap">
                {resume.contact_info?.email && (
                  <span className="flex items-center gap-0.5">
                    <span>{resume.contact_info.email}</span>
                  </span>
                )}
                {resume.contact_info?.phone && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>{resume.contact_info.phone}</span>
                  </>
                )}
                {resume.contact_info?.location && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>{resume.contact_info.location}</span>
                  </>
                )}
              </div>
              {(resume.contact_info?.linkedin || resume.contact_info?.website) && (
                <div className="flex items-center justify-center gap-1 text-blue-600 mt-0.5">
                  {resume.contact_info?.linkedin && (
                    <span>{resume.contact_info.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                  )}
                  {resume.contact_info?.linkedin && resume.contact_info?.website && (
                    <span className="text-slate-400">|</span>
                  )}
                  {resume.contact_info?.website && (
                    <span>{resume.contact_info.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            {resume.summary && (
              <div className="mb-1.5">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Summary</h5>
                <p className="text-slate-700 line-clamp-3">{resume.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resume.experience?.length > 0 && (
              <div className="mb-1.5">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Experience</h5>
                {resume.experience.slice(0, 2).map((exp: any, i: number) => (
                  <div key={i} className="mb-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{exp.position}</span>
                      <span className="text-slate-500 text-[4.5px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-700 italic">{exp.company}</span>
                      <span className="text-slate-500">{exp.location}</span>
                    </div>
                    {exp.achievements?.length > 0 && (
                      <ul className="mt-0.5 ml-2 text-slate-600">
                        {exp.achievements.slice(0, 2).map((ach: string, j: number) => (
                          <li key={j} className="truncate">• {ach}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resume.education?.length > 0 && (
              <div className="mb-1.5">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Education</h5>
                {resume.education.slice(0, 1).map((edu: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{edu.institution}</span>
                      <span className="text-slate-500 text-[4.5px]">{edu.endDate}</span>
                    </div>
                    <span className="text-slate-700">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
              <div className="mb-1">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Skills</h5>
                <p className="text-slate-700">{allSkills.join(' • ')}</p>
              </div>
            )}

            {/* Projects */}
            {resume.projects?.length > 0 && (
              <div className="mb-1">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Projects</h5>
                {resume.projects.slice(0, 1).map((proj: any, i: number) => (
                  <div key={i}>
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    {proj.technologies?.length > 0 && (
                      <span className="text-slate-500 ml-1">({proj.technologies.slice(0, 3).join(', ')})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {resume.certifications?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5" style={{ fontSize: '6px' }}>Certifications</h5>
                {resume.certifications.slice(0, 2).map((cert: any, i: number) => (
                  <div key={i} className="truncate">
                    <span className="font-semibold text-slate-900">{cert.name}</span>
                    <span className="text-slate-500"> - {cert.issuer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-white text-slate-900 shadow-lg font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Resume
            </Button>
          </div>
        </div>

        {/* Metadata Area */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 truncate text-base" title={resume.title}>
                {resume.title}
              </h3>

              {/* Target Job or Contact Name */}
              {resume.target_job ? (
                <div className="flex items-center gap-1.5 mt-1 text-blue-600">
                  <Briefcase className="w-3 h-3 flex-shrink-0" />
                  <p className="text-xs font-medium truncate" title={resume.target_job}>
                    {resume.target_job}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {resume.contact_info?.firstName ? `${resume.contact_info.firstName} ${resume.contact_info.lastName}` : 'Untitled Profile'}
                </p>
              )}

              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-medium">
                Last edited {new Date(resume.updated_at).toLocaleDateString()}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600 flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/builder?id=${resume.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStar?.(resume.id, resume.is_starred)}>
                  <Star className={cn("w-4 h-4 mr-2", resume.is_starred ? "fill-yellow-400 text-yellow-400" : "")} />
                  {resume.is_starred ? "Unpin Resume" : "Pin Resume"}
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
                  onSelect={(e) => {
                    e.preventDefault();
                    onDelete(resume.id);
                  }}
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
